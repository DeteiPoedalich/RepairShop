import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as OrdersIcon,
  AssignmentInd as RepairRequestsIcon, // Исправленная иконка для заявок
  Person as ClientsIcon,
  Computer as DevicesIcon,
  Build as ServicesIcon,
  People as UsersIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Дашборд', icon: <DashboardIcon />, roles: ['admin', 'employee'] },
  { path: '/orders', label: 'Заказы', icon: <OrdersIcon />, roles: ['admin', 'employee'] },
  { path: '/repair-requests', label: 'Заявки', icon: <RepairRequestsIcon />, roles: ['admin', 'employee'] },
  { path: '/clients', label: 'Клиенты', icon: <ClientsIcon />, roles: ['admin', 'employee'] },
  { path: '/devices', label: 'Устройства', icon: <DevicesIcon />, roles: ['admin', 'employee'] },
  { path: '/services', label: 'Услуги', icon: <ServicesIcon />, roles: ['admin', 'employee'] },
  { path: '/users', label: 'Пользователи', icon: <UsersIcon />, roles: ['admin'] }
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <Button
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </Button>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ремонт Техники
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  variant={location.pathname === item.path ? "outlined" : "text"}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.name} ({user?.role})
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>

      <Container sx={{ mt: 3, mb: 3, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;