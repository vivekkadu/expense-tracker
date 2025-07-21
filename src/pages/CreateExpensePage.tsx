import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ExpenseForm from '@/components/ExpenseForm';

const CreateExpensePage: React.FC = () => {
  const navigate = useNavigate();

  const handleExpenseAdded = () => {
    navigate('/expenses');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/expenses')}
            sx={{ mb: 2 }}
          >
            Back to Expenses
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Add New Expense
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the details below to submit a new expense
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3 }}>
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        </Paper>
      </Stack>
    </Container>
  );
};

export default CreateExpensePage;