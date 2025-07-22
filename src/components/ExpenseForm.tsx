import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Box,
  Alert,
  Stack,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
import { ExpenseFormData, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { useAppDispatch } from '../store';
import {
  createExpenseAsync,
  fetchExpensesAsync,
} from '../store/slices/expenseSlice';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseAdded }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    category: ExpenseCategory.OTHER,
    description: '',
    date: new Date(),
  });
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange =
    (field: keyof ExpenseFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'amount'
          ? parseFloat(event.target.value) || 0
          : event.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleDateChange = (newDate: Dayjs | null) => {
    setSelectedDate(newDate);
    if (newDate) {
      setFormData(prev => ({
        ...prev,
        date: newDate.toDate(),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await dispatch(
        createExpenseAsync(formData) as any
      ).unwrap();
      console.log('Expense created successfully:', result);

      // Show success toast
      toast.success('Expense created successfully!');

      // Refresh the expenses list in the background
      dispatch(fetchExpensesAsync({}));

      // Reset form
      setFormData({
        amount: 0,
        category: ExpenseCategory.OTHER,
        description: '',
        date: new Date(),
      });
      setSelectedDate(dayjs());

      // Navigate to expense list
      onExpenseAdded();
    } catch (err: unknown) {
      console.error('Error creating expense:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to create expense. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.amount > 0 &&
    formData.category &&
    formData.description &&
    formData.date;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add New Expense
      </Typography>

      

      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flex: 1, minWidth: '200px' }}
                  label="Amount"
                  type="number"
                  value={formData.amount || ''}
                  onChange={handleInputChange('amount')}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />

                <TextField
                  sx={{ flex: 1, minWidth: '200px' }}
                  select
                  label="Category"
                  value={formData.category}
                  onChange={handleInputChange('category')}
                  required
                >
                  {EXPENSE_CATEGORIES.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                required
                multiline
                rows={3}
              />

              <Box sx={{ maxWidth: '300px' }}>
                <TextField
                  label="Date"
                  type="date"
                  value={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}
                  onChange={e => {
                    const newDate = dayjs(e.target.value);
                    handleDateChange(newDate.isValid() ? newDate : null);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              </Box>

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!isFormValid || loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Adding Expense...' : 'Add Expense'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExpenseForm;
