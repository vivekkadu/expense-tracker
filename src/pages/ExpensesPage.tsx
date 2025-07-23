import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Stack, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchExpensesAsync, setPage } from '@/store/slices/expenseSlice';
import { ExpenseFilters } from '@/types';

// Lazy load ExpenseList for better performance
const ExpenseList = React.lazy(() => import('@/components/ExpenseList'));

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const expensesState = useAppSelector((state) => state.expenses);
  const expenses = expensesState.expenses;
  const expensesLoading = expensesState.isLoading;
  const pagination = expensesState.pagination;
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Memoized filters from URL with date support
  const filters = useMemo((): ExpenseFilters => {
    const filterObj: ExpenseFilters = {
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
    };
    
    // Handle date filters
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    if (dateFrom) {
      filterObj.dateFrom = new Date(dateFrom);
    }
    if (dateTo) {
      filterObj.dateTo = new Date(dateTo);
    }
    
    return filterObj;
  }, [searchParams]);
  
  // Memoized pagination values
  const currentPage = useMemo(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  }, [searchParams]);
  
  const currentLimit = useMemo(() => {
    const limit = searchParams.get('limit');
    return limit ? parseInt(limit, 10) : 10;
  }, [searchParams]);

  // Optimized fetch function with debouncing
  const fetchExpenses = useCallback(async (page?: number, limit?: number, newFilters?: ExpenseFilters) => {
    if (!user) return;
    
    try {
      const fetchPage = page ?? currentPage;
      const fetchLimit = limit ?? currentLimit;
      const fetchFilters = newFilters ?? filters;
      
      await dispatch(fetchExpensesAsync({
        page: fetchPage,
        limit: fetchLimit,
        filters: fetchFilters
      }) as any).unwrap();
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, [user, currentPage, currentLimit, filters, dispatch]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
    dispatch(setPage(page));
  }, [searchParams, setSearchParams, dispatch]);
  
  // Handle filters change
  // Enhanced handleFiltersChange to support dates
  const handleFiltersChange = useCallback((newFilters: ExpenseFilters) => {
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');
    newSearchParams.set('limit', currentLimit.toString());
    
    if (newFilters.category) {
      newSearchParams.set('category', newFilters.category);
    }
    if (newFilters.status) {
      newSearchParams.set('status', newFilters.status);
    }
    if (newFilters.dateFrom) {
      newSearchParams.set('dateFrom', newFilters.dateFrom.toISOString().split('T')[0]);
    }
    if (newFilters.dateTo) {
      newSearchParams.set('dateTo', newFilters.dateTo.toISOString().split('T')[0]);
    }
    
    setSearchParams(newSearchParams);
    dispatch(setPage(1));
  }, [currentLimit, setSearchParams, dispatch]);

  // Single useEffect for data fetching
  useEffect(() => {
    if (user) {
      fetchExpenses(currentPage, currentLimit, filters);
    }
  }, [user, currentPage, currentLimit, filters, fetchExpenses]);

  // Optimized refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    fetchExpenses(currentPage, currentLimit, filters);
  }, [fetchExpenses, currentPage, currentLimit, filters]);

  // Handle loading state
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Handle case where user is not authenticated
  if (!user || !user.id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" align="center">
          Please log in to view expenses.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Expenses {user?.role === 'admin' && '(All Team Members)'}
          </Typography>
        </Box>
        
        {user?.role !== 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/expenses/create')}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Add Expense
          </Button>
        )}
      </Stack>
      
      <React.Suspense fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      }>
        <ExpenseList 
          currentUser={user} 
          expenses={expenses || []}
          pagination={pagination}
          refreshTrigger={refreshTrigger}
          onRefresh={handleRefresh}
          onPageChange={handlePageChange}
          onFiltersChange={handleFiltersChange}
          filters={filters}
        />
      </React.Suspense>
    </Container>
  );
};

export default ExpensesPage;