import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  TextField,
  MenuItem,
  Stack,
  Pagination,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { CheckCircle, Cancel, Pending } from '@mui/icons-material';
import { Expense, User, ExpenseFilters } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { useAppDispatch } from '../store';
import {
  updateExpenseStatusAsync,
  fetchExpensesAsync,
} from '../store/slices/expenseSlice';

interface ExpenseListProps {
  currentUser: User | null;
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refreshTrigger: number;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: ExpenseFilters) => void;
  filters: ExpenseFilters;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  currentUser,
  expenses,
  pagination,
  refreshTrigger,
  onRefresh,
  onPageChange,
  onFiltersChange,
  filters,
}) => {
  const dispatch = useAppDispatch();
  const [loadingExpenses, setLoadingExpenses] = useState<Set<string>>(
    new Set()
  );
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, 'approved' | 'rejected'>
  >(new Map());
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Add state for date filters - only dateFrom for single date filter
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    filters.dateFrom ? dayjs(filters.dateFrom) : null
  );

  // Background data refresh after successful status update
  const refreshDataInBackground = useCallback(async () => {
    try {
      await dispatch(
        fetchExpensesAsync({
          page: pagination.page,
          limit: pagination.limit,
          filters,
        }) as any
      ).unwrap();
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }, [dispatch, pagination.page, pagination.limit, filters]);

  // Show toast notification
  const showToast = useCallback(
    (message: string, severity: 'success' | 'error') => {
      setToast({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  // Close toast
  const handleCloseToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  // Enhanced filter change to handle dates
  const handleFilterChange = useCallback(
    (filterType: keyof ExpenseFilters, value: string | Date | null) => {
      const newFilters = { ...filters };
      
      if (filterType === 'dateFrom' || filterType === 'dateTo') {
        if (value instanceof Date) {
          newFilters[filterType] = value;
        } else if (value === null) {
          delete newFilters[filterType];
        }
      } else {
        if (value && value !== '') {
          newFilters[filterType] = value as string;
        } else {
          delete newFilters[filterType];
        }
      }
      
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  // Handle date change - now declared after handleFilterChange
  const handleDateChange = useCallback((newValue: Dayjs | null) => {
    setDateFrom(newValue);
    // Create date at noon to avoid timezone issues
    const date = newValue ? new Date(newValue.year(), newValue.month(), newValue.date(), 12, 0, 0) : null;
    handleFilterChange('dateFrom', date);
  }, [handleFilterChange]);

  // Clear all filters function
  const handleClearFilters = useCallback(() => {
    setDateFrom(null);
    onFiltersChange({});
  }, [onFiltersChange]);

  // Optimized status update with background refresh and toast
  const handleStatusUpdate = useCallback(
    async (expenseId: string, status: 'approved' | 'rejected') => {
      // Add to loading state
      setLoadingExpenses(prev => new Set(prev).add(expenseId));

      // Optimistic update
      setOptimisticUpdates(prev => new Map(prev).set(expenseId, status));

      try {
        await dispatch(
          updateExpenseStatusAsync({ id: expenseId, status }) as any
        ).unwrap();

        // Success - show toast and refresh data in background
        const statusText = status === 'approved' ? 'approved' : 'rejected';
        showToast(`Expense ${statusText} successfully!`, 'success');

        // Remove optimistic update
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(expenseId);
          return newMap;
        });

        // Refresh data in background without showing loading state
        setTimeout(() => {
          refreshDataInBackground();
        }, 500); // Small delay to let user see the optimistic update
      } catch (error) {
        console.error('Failed to update expense status:', error);

        // Show error toast
        showToast(
          'Failed to update expense status. Please try again.',
          'error'
        );

        // Revert optimistic update on error
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(expenseId);
          return newMap;
        });
      } finally {
        // Remove from loading state
        setLoadingExpenses(prev => {
          const newSet = new Set(prev);
          newSet.delete(expenseId);
          return newSet;
        });
      }
    },
    [dispatch, showToast, refreshDataInBackground]
  );

  // Memoized expenses with optimistic updates
  const displayExpenses = useMemo(() => {
    return expenses.map(expense => {
      const optimisticStatus = optimisticUpdates.get(expense.id);
      return optimisticStatus
        ? { ...expense, status: optimisticStatus }
        : expense;
    });
  }, [expenses, optimisticUpdates]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Pending color="warning" />;
    }
  }, []);

  const getStatusColor = useCallback(
    (
      status: string
    ):
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning' => {
      switch (status) {
        case 'approved':
          return 'success';
        case 'rejected':
          return 'error';
        default:
          return 'warning';
      }
    },
    []
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total expenses: {pagination.total} | Page {pagination.page} of{' '}
          {pagination.totalPages}
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Filters
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleClearFilters}
                sx={{ minWidth: 'auto' }}
              >
                Clear All
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {/* Category Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={filters.category || ''}
                  onChange={e => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {EXPENSE_CATEGORIES.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={filters.status || ''}
                  onChange={e => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
              </Grid>

              {/* Single Date Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Date"
                  value={dateFrom}
                  onChange={handleDateChange}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                {currentUser?.role === 'admin' && <TableCell>Employee</TableCell>}
                <TableCell>Status</TableCell>
                {currentUser?.role === 'admin' && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayExpenses.map(expense => {
                const isLoading = loadingExpenses.has(expense.id);
                const hasOptimisticUpdate = optimisticUpdates.has(expense.id);

                return (
                  <TableRow
                    key={expense.id}
                    sx={{
                      opacity: isLoading ? 0.7 : 1,
                      backgroundColor: hasOptimisticUpdate
                        ? 'action.hover'
                        : 'inherit',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <TableCell>
                      {expense.date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    {currentUser?.role === 'admin' && (
                      <TableCell>
                        {expense.user
                          ? `${expense.user.firstName} ${expense.user.lastName}`
                          : 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(expense.status)}
                        <Chip
                          label={
                            expense.status.charAt(0).toUpperCase() +
                            expense.status.slice(1)
                          }
                          color={getStatusColor(expense.status)}
                          size="small"
                          sx={{
                            transition: 'all 0.3s ease',
                            ...(hasOptimisticUpdate && {
                              animation: 'pulse 1s infinite',
                            }),
                          }}
                        />
                        {isLoading && <CircularProgress size={16} />}
                      </Box>
                    </TableCell>
                    {currentUser?.role === 'admin' && (
                      <TableCell>
                        {expense.status === 'pending' && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={isLoading}
                              onClick={() =>
                                handleStatusUpdate(expense.id, 'approved')
                              }
                              sx={{ minWidth: '80px' }}
                            >
                              {isLoading ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              disabled={isLoading}
                              onClick={() =>
                                handleStatusUpdate(expense.id, 'rejected')
                              }
                              sx={{ minWidth: '80px' }}
                            >
                              {isLoading ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                'Reject'
                              )}
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(event, page) => {
                onPageChange(page);
              }}
              color="primary"
            />
          </Box>
        )}

        {/* Results summary */}
        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Showing {displayExpenses.length} of {pagination.total} expenses
          </Typography>
        </Box>

        {displayExpenses.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No expenses found
            </Typography>
          </Box>
        )}

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default React.memo(ExpenseList);
