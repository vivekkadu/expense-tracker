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
  Divider,
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
import { ExpenseStats, UserRole } from '../types';
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
  const { user } = useAppSelector((state) => state.auth); // Get current user
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const theme = useTheme();

  // Check if current user is admin
  const isAdmin = user?.role === UserRole.ADMIN;

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
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
        Dashboard
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Stack spacing={4}>
        {/* Quick Actions */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#555' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {/* Conditionally render Add New Expense card only for non-admin users */}
            {!isAdmin && (
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                    border: '1px solid #e0e0e0',
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Add sx={{ mr: 2, fontSize: 28, color: '#666' }} />
                      <Typography variant="h6" sx={{ color: '#333' }}>
                        Add New Expense
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" variant="body2">
                      Quickly add a new expense entry
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      size="medium" 
                      variant="contained" 
                      onClick={() => navigate('/expenses/create')}
                      fullWidth
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: '#1976d2',
                        '&:hover': { backgroundColor: '#1565c0' }
                      }}
                    >
                      Add Expense
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
            <Grid item xs={12} sm={isAdmin ? 12 : 6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                  border: '1px solid #e0e0e0',
                  '&:hover': { 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Receipt sx={{ mr: 2, fontSize: 28, color: '#666' }} />
                    <Typography variant="h6" sx={{ color: '#333' }}>
                      View All Expenses
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Browse and manage your expenses
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    size="medium" 
                    variant="outlined" 
                    onClick={() => navigate('/expenses')}
                    fullWidth
                    sx={{ 
                      borderRadius: 2,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': { 
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
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
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#555' }}>
            Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                border: '1px solid #e0e0e0'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <AccountBalanceWallet sx={{ mr: 2, fontSize: 28, color: '#666' }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Total Amount
                      </Typography>
                      <Typography variant="h5" sx={{ color: '#333', fontWeight: 600 }}>
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
              <Card sx={{ 
                height: '100%', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                border: '1px solid #e0e0e0'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <PendingActions sx={{ mr: 2, fontSize: 28, color: '#ff9800' }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Pending Expenses
                      </Typography>
                      <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 600 }}>
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
              <Card sx={{ 
                height: '100%', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                border: '1px solid #e0e0e0'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <CheckCircle sx={{ mr: 2, fontSize: 28, color: '#4caf50' }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Approved Amount
                      </Typography>
                      <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 600 }}>
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
              <Card sx={{ 
                height: '100%', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                border: '1px solid #e0e0e0'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center">
                    <Cancel sx={{ mr: 2, fontSize: 28, color: '#f44336' }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Rejected Expenses
                      </Typography>
                      <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 600 }}>
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
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#555' }}>
            Category Breakdown
          </Typography>
          <Grid container spacing={3}>
            {categoryStats?.map((category: { category: string; count: number; totalAmount: string }, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={category.category}>
                <Card sx={{ 
                  height: '100%', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                  border: '1px solid #e0e0e0',
                  '&:hover': { 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" component="div" sx={{ color: '#333' }}>
                        {category.category}
                      </Typography>
                      <Chip 
                        label={category.count} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 600 }} gutterBottom>
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
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#555' }}>
              Analytics
            </Typography>
            <Card>
                <ExpenseChart stats={stats} />
            </Card>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default Dashboard;