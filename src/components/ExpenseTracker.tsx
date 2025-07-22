import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { AccountCircle, ExitToApp } from '@mui/icons-material';
import { User, ExpenseFilters } from '../types';
import { authService } from '../services/authService';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchExpensesAsync, setPage } from '../store/slices/expenseSlice';
import Dashboard from './Dashboard';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import LoginForm from './LoginForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ExpenseTracker: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<ExpenseFilters>({}); // Add filters state

  const dispatch = useAppDispatch();
  const expensesState = useAppSelector(state => state.expenses);
  const expenses = expensesState.expenses;
  const pagination = expensesState.pagination;

  useEffect(() => {
    // Check if user is already logged in
    const checkCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setCurrentUser(response.data);
      } catch (error) {
        console.log('No user logged in');
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchExpensesAsync({ filters }) as any);
    }
  }, [currentUser, refreshTrigger, dispatch, filters]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setTabValue(0);
      setAnchorEl(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setTabValue(1); // Switch to expense list tab
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    if (currentUser) {
      dispatch(fetchExpensesAsync({ filters }) as any);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    if (currentUser) {
      dispatch(fetchExpensesAsync({ 
        page, 
        limit: pagination.limit,
        filters 
      }) as any);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
    dispatch(setPage(1)); // Reset to page 1 when filters change
    if (currentUser) {
      dispatch(fetchExpensesAsync({ 
        page: 1, 
        limit: pagination.limit,
        filters: newFilters 
      }) as any);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Expense Tracker
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {currentUser && (
              <Typography variant="body2" sx={{ mr: 2 }}>
                {`${currentUser.firstName} ${currentUser.lastName}`} (
                {currentUser.role})
              </Typography>
            )}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="expense tracker tabs"
          >
            <Tab label="Dashboard" />
            <Tab label="Expenses" />
            <Tab label="Add Expense" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Dashboard refreshTrigger={refreshTrigger} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {currentUser && (
            <ExpenseList
              currentUser={currentUser}
              expenses={expenses}
              pagination={pagination}
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefresh}
              onPageChange={handlePageChange}
              onFiltersChange={handleFiltersChange}
              filters={filters}
            />
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default ExpenseTracker;
