import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Stack, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ExpenseList from '@/components/ExpenseList';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchExpensesAsync } from '@/store/slices/expenseSlice';

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const expensesState = useAppSelector((state) => state.expenses);
  const expenses = expensesState.expenses;
  const expensesLoading = expensesState.isLoading;
  const pagination = expensesState.pagination;
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  console.log("expenses", expenses)

  const fetchExpenses = async () => {
    try {
      console.log('ExpensesPage: Starting to fetch expenses');
      const result = await dispatch(fetchExpensesAsync({}) as any).unwrap();
      console.log('ExpensesPage: Fetch expenses result:', result);
    } catch (error) {
      console.error('ExpensesPage: Failed to fetch expenses:', error);
    }
  };

  useEffect(() => {
    console.log('ExpensesPage: Component mounted, user:', user);
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  useEffect(() => {
    console.log('ExpensesPage: Expenses updated:', expenses);
    console.log('ExpensesPage: Expenses length:', expenses?.length);
  }, [expenses]);

  useEffect(() => {
    console.log('ExpensesPage: Expenses state updated:', expenses);
    console.log('ExpensesPage: Expenses loading state:', expensesLoading);
    console.log('ExpensesPage: Expenses error state:', expensesState.error);
  }, [expenses, expensesLoading, expensesState.error]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchExpenses();
  };

  // Add useEffect to refetch when returning from create page
  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, refreshTrigger]);

  // Handle loading state
  if (authLoading || expensesLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Handle case where user is not authenticated or incomplete
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
            Expenses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your expenses
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/expenses/create')}
          sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
        >
          Add Expense
        </Button>
      </Stack>
      
      <ExpenseList 
        currentUser={user} 
        expenses={expenses || []}
        pagination={pagination}
        refreshTrigger={refreshTrigger}
        onRefresh={handleRefresh}
      />
    </Container>
  );
};

export default ExpensesPage;