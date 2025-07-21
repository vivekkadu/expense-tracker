import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { useAppDispatch } from '@/store';
import { fetchStatsAsync } from '@/store/slices/expenseSlice';
import Dashboard from '@/components/Dashboard';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStats = async () => {
    try {
      await dispatch(fetchStatsAsync() as any).unwrap();
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Dashboard refreshTrigger={refreshTrigger} />
    </Container>
  );
};

export default DashboardPage;
