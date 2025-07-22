import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Card,
  CardContent,
  Grid,
  Fade,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useAppDispatch } from '@/store';
import { fetchStatsAsync } from '@/store/slices/expenseSlice';
import Dashboard from '@/components/Dashboard';
import {
  TrendingUp,
  Analytics,
  Refresh,
  Dashboard as DashboardIcon,
  Insights,
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      await dispatch(fetchStatsAsync() as any).unwrap();
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setIsLoaded(true);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.light, 0.05)} 0%, 
          ${alpha(theme.palette.background.default, 0.95)} 100%
        )`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in={isLoaded} timeout={800}>
          <Paper
            elevation={3}
            sx={{
              padding: 1,
              borderRadius: 2,
            }}
          >
            <Dashboard refreshTrigger={refreshTrigger} />
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default DashboardPage;
