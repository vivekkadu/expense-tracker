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
    <Container sx={{ my: 2, py: 2, mx: 2, backgroundColor: '#ffff' }}>
      <Stack spacing={3}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/expenses')}
            sx={{ mb: 2 }}
          >
            Back to Expenses
          </Button>
        </Box>

        <ExpenseForm onExpenseAdded={handleExpenseAdded} />
      </Stack>
    </Container>
  );
};

export default CreateExpensePage;
