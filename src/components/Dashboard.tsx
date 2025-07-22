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
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalanceWallet,
  Category,
  DateRange,
  Add,
  Receipt,
  PendingActions,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ExpenseStats } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { expenseService } from '../services/expenseService';
import { fetchStatsAsync } from '../store/slices/expenseSlice';
import ExpenseChart from './ExpenseChart';

interface DashboardProps {
  refreshTrigger: number;
}

const Dashboard: React.FC<DashboardProps> = ({ refreshTrigger }) => {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.expenses);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    console.log('Dashboard useEffect triggered, refreshTrigger:', refreshTrigger);
    const fetchDashboardData = async () => {
      console.log('Starting dashboard data fetch...');
      setLoading(true);
      setError('');
      try {
        console.log('Dispatching fetchStatsAsync...');
        await dispatch(fetchStatsAsync(undefined) as any).unwrap();
        console.log('fetchStatsAsync completed, now calling getDashboardStats...');
        const dashboardResponse = await expenseService.getDashboardStats();
        console.log('Dashboard stats response:', dashboardResponse);
        console.log('Dashboard stats data:', dashboardResponse.data);
        console.log('Setting dashboard stats...');
        setDashboardStats(dashboardResponse.data);
        console.log('Dashboard stats set successfully');
      } catch (err: unknown) {
        console.error('Error in fetchDashboardData:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        console.error('Error message:', errorMessage);
        setError(errorMessage);
      } finally {
        console.log('Dashboard data fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger, dispatch]);
  
  const navigate = useNavigate();

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" align="center" color="error">
        {error}
      </Typography>
    );
  }

  if (!dashboardStats) {
    return (
      <Typography variant="h6" align="center">
        Failed to load dashboard data
      </Typography>
    );
  }

  const { totalStats, categoryStats } = dashboardStats;

  const calculateTotalFromCategories = () => {
    if (!categoryStats || !Array.isArray(categoryStats)) return 0;
    return categoryStats.reduce((total, category) => {
      return total + parseFloat(category.totalAmount || '0');
    }, 0);
  };

  const totalAmountFromCategories = calculateTotalFromCategories();

  return (
    <Box sx={{ p: 0.4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      
      <Stack spacing={5}>
        {/* Quick Actions */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Add color="primary" sx={{ mr: 2, fontSize: 30 }} />
                    <Typography variant="h6">
                      Add New Expense
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Quickly add a new expense entry
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    size="medium" 
                    variant="contained" 
                    onClick={() => navigate('/expenses/create')}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Add Expense
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Receipt color="secondary" sx={{ mr: 2, fontSize: 30 }} />
                    <Typography variant="h6">
                      View All Expenses
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Browse and manage your expenses
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    size="medium" 
                    variant="outlined" 
                    onClick={() => navigate('/expenses')}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    View Expenses
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Overview Cards */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: alpha(theme.palette.primary.light, 0.1), height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <AccountBalanceWallet color="primary" sx={{ mr: 2, fontSize: 30 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Amount
                      </Typography>
                      <Typography variant="h5" color="primary">
                        ${totalAmountFromCategories.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {totalStats?.totalExpenses || 0} expenses
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: alpha(theme.palette.warning.light, 0.1), height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <PendingActions color="warning" sx={{ mr: 2, fontSize: 30 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Pending Expenses
                      </Typography>
                      <Typography variant="h5" color="warning">
                        {totalStats?.pendingExpenses || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Awaiting approval
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: alpha(theme.palette.success.light, 0.1), height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <CheckCircle color="success" sx={{ mr: 2, fontSize: 30 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Approved Amount
                      </Typography>
                      <Typography variant="h5" color="success">
                        ${parseFloat(totalStats?.totalApprovedAmount || '0').toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {totalStats?.approvedExpenses || 0} approved
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: alpha(theme.palette.error.light, 0.1), height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <Cancel color="error" sx={{ mr: 2, fontSize: 30 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Rejected Expenses
                      </Typography>
                      <Typography variant="h5" color="error">
                        {totalStats?.rejectedExpenses || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Need revision
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Category Breakdown */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Category Breakdown
          </Typography>
          <Grid container spacing={3}>
            {categoryStats?.map((category: { category: string; count: number; totalAmount: string }, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={category.category}>
                <Card sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" component="div">
                        {category.category}
                      </Typography>
                      <Chip 
                        label={category.count} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="h4" color="primary" gutterBottom>
                      ${parseFloat(category.totalAmount || '0').toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count} expense{category.count !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg: ${category.count > 0 ? (parseFloat(category.totalAmount || '0') / category.count).toFixed(2) : '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Charts */}
        {stats && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Analytics
            </Typography>
            <ExpenseChart stats={stats} />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default Dashboard;