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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchExpenses = async () => {
    try {
      await dispatch(fetchExpensesAsync({}) as any).unwrap();
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchExpenses();
  };

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
  if (!user) {
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
        currentUser={user!} 
        refreshTrigger={refreshTrigger}
        onRefresh={handleRefresh}
      />
    </Container>
  );
};

export default ExpensesPage;