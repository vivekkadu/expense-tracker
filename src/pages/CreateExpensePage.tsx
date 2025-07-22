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
    <Container sx={{ my: 2, py: 1, mx: 0, backgroundColor: '#ffff' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/expenses')}
            sx={{ mb: 1.5 }}
          >
            Back to Expenses
          </Button>
        </Box>

        <ExpenseForm onExpenseAdded={handleExpenseAdded} />
    </Container>
  );
};

export default CreateExpensePage;
