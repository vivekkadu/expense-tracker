import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Button,
  Grid,
  CardActions,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalanceWallet,
  Category,
  DateRange,
  Add,
  Receipt,
  Analytics,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ExpenseStats } from '../types';
import { apiService } from '../services/api';
import ExpenseChart from './ExpenseChart';

interface DashboardProps {
  refreshTrigger: number;
}

const Dashboard: React.FC<DashboardProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const expenseStats = await apiService.getExpenseStats();
        setStats(expenseStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography variant="h6" align="center">
        Failed to load dashboard data
      </Typography>
    );
  }

  const categoryCount = Object.keys(stats.categoryBreakdown).length;
  const monthCount = stats.monthlyTrend.length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Stack spacing={4}>
        {/* Quick Actions */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Add color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">
                      Add New Expense
                    </Typography>
                  </Box>
                  <Typography color="textSecondary">
                    Quickly add a new expense entry
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => navigate('/expenses/create')}
                    fullWidth
                  >
                    Add Expense
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Receipt color="secondary" sx={{ mr: 2 }} />
                    <Typography variant="h6">
                      View All Expenses
                    </Typography>
                  </Box>
                  <Typography color="textSecondary">
                    Browse and manage your expenses
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => navigate('/expenses')}
                    fullWidth
                  >
                    View Expenses
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Analytics color="success" sx={{ mr: 2 }} />
                    <Typography variant="h6">
                      Expense Reports
                    </Typography>
                  </Box>
                  <Typography color="textSecondary">
                    Generate detailed expense reports
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    disabled
                    fullWidth
                  >
                    Coming Soon
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Cards */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <AccountBalanceWallet color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Expenses
                      </Typography>
                      <Typography variant="h5">
                        ${stats.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Category color="secondary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Categories
                      </Typography>
                      <Typography variant="h5">
                        {categoryCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <DateRange color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Active Months
                      </Typography>
                      <Typography variant="h5">
                        {monthCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUp color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Avg per Category
                      </Typography>
                      <Typography variant="h5">
                        ${categoryCount > 0 ? (stats.totalAmount / categoryCount).toFixed(2) : '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Charts */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Analytics
          </Typography>
          <ExpenseChart stats={stats} />
        </Box>
      </Stack>
    </Box>
  );
};

export default Dashboard;