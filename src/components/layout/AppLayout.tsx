import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Dashboard as DashboardIcon,
  Receipt,
  Add,
  Menu as MenuIcon,
  AttachMoney,
  Analytics,
  Settings,
  Person,
  Notifications,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutAsync } from '@/store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 260;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync() as any).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      description: 'Overview & Analytics',
    },
    {
      text: 'Expenses',
      icon: <Receipt />,
      path: '/expenses',
      description: 'View & Manage',
    },
    {
      text: 'Add Expense',
      icon: <Add />,
      path: '/expenses/create',
      description: 'Create New Entry',
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.text === 'Add Expense' && user?.role === 'admin') {
      return false;
    }
    return true;
  });

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section - Made Smaller */}
      <Box 
        sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoney sx={{ fontSize: 24, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Expense Tracker
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
          Manage your finances efficiently
        </Typography>
      </Box>

      <Divider />

      {/* User Info Section - Made Smaller */}
      {user && (
        <Box sx={{ p: 1.5 }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1.5, 
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: '#1976d2',
                  mr: 1.5,
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                {(user.name || user.firstName || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                  {user.name || `${user.firstName} ${user.lastName}`}
                </Typography>
                <Chip 
                  label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  size="small"
                  sx={{ 
                    height: 18,
                    fontSize: '0.65rem',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    fontWeight: 500,
                    mt: 0.5
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      <Divider />

      {/* Navigation Section */}
      <Box sx={{ flex: 1, p: 1 }}>
      
        <List sx={{ px: 1 }}>
          {filteredNavigationItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) {
                      setMobileOpen(false);
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: '#1976d2',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: isSelected ? '#1565c0' : 'rgba(25, 118, 210, 0.08)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 36,
                      color: isSelected ? 'white' : '#666'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 500, fontSize: '0.9rem' }}>
                        {item.text}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                          fontSize: '0.65rem'
                        }}
                      >
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            textAlign: 'center',
            display: 'block',
            fontSize: '0.7rem'
          }}
        >
          © 2024 Expense Tracker
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: '#333',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important', py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {filteredNavigationItems.find(item => item.path === location.pathname)?.text || 'Expense Tracker'}
          </Typography>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!isMobile && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                    {user.name || `${user.firstName} ${user.lastName}`}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, color: '#666' }}>
                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </Typography>
                </Box>
              )}
              
              <IconButton
                size="large"
                aria-label="account menu"
                onClick={handleMenuClick}
                sx={{ 
                  color: '#333',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2', fontSize: '1rem' }}>
                  {(user.name || user.firstName || 'U').charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 180,
                  }
                }}
              >
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                      color: '#f44336'
                    }
                  }}
                >
                  <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid #e0e0e0',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0.2,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '72px',
          minHeight: 'calc(100vh - 72px)', 
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;