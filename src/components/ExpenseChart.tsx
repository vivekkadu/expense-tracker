import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack
} from '@mui/material';
import { ExpenseStats } from '../types';

interface ExpenseChartProps {
  stats: ExpenseStats;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ stats }) => {
  const maxCategoryAmount = Math.max(...Object.values(stats.categoryBreakdown));
  const maxMonthlyAmount = Math.max(...stats.monthlyTrend.map(item => item.amount));

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Box sx={{ flex: 1 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            {Object.entries(stats.categoryBreakdown).map(([category, amount]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${amount.toFixed(2)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(amount / maxCategoryAmount) * 100}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Expenses
            </Typography>
            {stats.monthlyTrend.map((item) => (
              <Box key={item.month} sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{item.month}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${item.amount.toFixed(2)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.amount / maxMonthlyAmount) * 100}
                  sx={{ mt: 0.5 }}
                  color="secondary"
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
};

export default ExpenseChart;