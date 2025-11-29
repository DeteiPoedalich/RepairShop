import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import Clients from './pages/Clients';
import Devices from './pages/Devices';
import Services from './pages/Services';
import Users from './pages/Users';
import RepairRequests from './pages/RepairRequests';
import Layout from './components/Layout';
import ClientRegister from './pages/ClientRegister';
import ClientDashboard from './pages/ClientDashboard';
import NewRepairRequest from './pages/NewRepairRequest';
import { CircularProgress, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const ClientProtectedRoute = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      const client = localStorage.getItem('client');
      const clientToken = localStorage.getItem('clientToken');
      setIsAuthenticated(!!(client && clientToken));
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Компонент для проверки инициализации авторизации
const AppRoutes = () => {
  const { loading } = useAuth();

  // Показываем общий индикатор загрузки при инициализации приложения
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<Login />} />
      <Route path="/client-register" element={<ClientRegister />} />
      
      {/* Защищенные маршруты для клиентов */}
      <Route path="/client/dashboard" element={
        <ClientProtectedRoute>
          <ClientDashboard />
        </ClientProtectedRoute>
      } />
      <Route path="/client/new-request" element={
        <ClientProtectedRoute>
          <NewRepairRequest />
        </ClientProtectedRoute>
      } />
      
      {/* Защищенные маршруты для сотрудников */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout>
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders/new" element={
        <ProtectedRoute>
          <Layout>
            <NewOrder />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders/:id" element={
        <ProtectedRoute>
          <Layout>
            <OrderDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute>
          <Layout>
            <Clients />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/devices" element={
        <ProtectedRoute>
          <Layout>
            <Devices />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/services" element={
        <ProtectedRoute>
          <Layout>
            <Services />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/repair-requests" element={
        <ProtectedRoute>
          <Layout>
            <RepairRequests />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Админские маршруты */}
      <Route path="/users" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;