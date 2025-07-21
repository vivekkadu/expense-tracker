import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  TextField,
  MenuItem,
  Stack
} from '@mui/material';
import { CheckCircle, Cancel, Pending } from '@mui/icons-material';
import { Expense, User } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { apiService } from '../services/api';

interface ExpenseListProps {
  currentUser: User;
  refreshTrigger: number;
  onRefresh: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ currentUser, refreshTrigger, onRefresh }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    status: ''
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const expenseList = await apiService.getExpenses(
          currentUser.role === 'employee' ? currentUser.id : undefined
        );
        setExpenses(expenseList);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [currentUser, refreshTrigger]);

  const handleStatusUpdate = async (expenseId: string, status: 'approved' | 'rejected') => {
    try {

        
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Expenses {currentUser.role === 'admin' && '(All Team Members)'}
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
              <TableCell>Status</TableCell>
              {currentUser.role === 'admin' && <TableCell>Actions</TableCell>}
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
                {currentUser.role === 'admin' && (
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