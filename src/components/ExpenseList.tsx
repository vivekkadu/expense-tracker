import React, { useState } from 'react';
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
  Pagination
} from '@mui/material';
import { CheckCircle, Cancel, Pending } from '@mui/icons-material';
import { Expense, User } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { useAppDispatch } from '../store';
import { updateExpenseAsync } from '../store/slices/expenseSlice';
import { updateExpenseStatusAsync } from '../store/slices/expenseSlice';
import { expenseService } from '../services/expenseService';

interface ExpenseListProps {
  currentUser: User | null;  // Allow null
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refreshTrigger: number;
  onRefresh: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ 
  currentUser, 
  expenses, 
  pagination, 
  refreshTrigger, 
  onRefresh 
}) => {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState({
    category: '',
    status: ''
  });

  const handleStatusUpdate = async (expenseId: string, status: 'approved' | 'rejected') => {
    try {
      await dispatch(updateExpenseStatusAsync({ id: expenseId, status }) as any).unwrap();
      onRefresh();
    } catch (error) {
      console.error('Failed to update expense status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Pending color="warning" />;
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const categoryMatch = !filter.category || expense.category === filter.category;
    const statusMatch = !filter.status || expense.status === filter.status;
    return categoryMatch && statusMatch;
  });

  console.log('ExpenseList: Received expenses:', expenses);
  console.log('ExpenseList: Current user:', currentUser);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Expenses {currentUser?.role === 'admin' && '(All Team Members)'}
      </Typography>
      
      {/* Add debug info */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Total expenses: {expenses?.length || 0}
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              sx={{ flex: 1 }}
              select
              label="Category"
              value={filter.category}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
            >
              <MenuItem value="">All Categories</MenuItem>
              {EXPENSE_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              sx={{ flex: 1 }}
              select
              label="Status"
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Stack>
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
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}</TableCell>
                <TableCell>${expense.amount.toFixed(2)}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                {currentUser?.role === 'admin' && (
                  <TableCell>
                    {expense.user ? `${expense.user.firstName} ${expense.user.lastName}` : 'Unknown'}
                  </TableCell>
                )}
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(expense.status)}
                    <Chip
                      label={expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      color={getStatusColor(expense.status)}
                      size="small"
                    />
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
                          onClick={() => handleStatusUpdate(expense.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleStatusUpdate(expense.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
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
              // Pagination handling would be done in parent component
              // For now, we'll just call onRefresh
              onRefresh();
            }}
            color="primary"
          />
        </Box>
      )}
      
      {/* Results summary */}
      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Showing {filteredExpenses.length} of {pagination.total} expenses
        </Typography>
      </Box>
      
      {filteredExpenses.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No expenses found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExpenseList;