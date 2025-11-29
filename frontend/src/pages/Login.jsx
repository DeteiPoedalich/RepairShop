import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Link
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { authService } from '../services/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [employeeData, setEmployeeData] = useState({
    email: 'admin@repair.ru',
    password: 'password'
  });
  const [clientData, setClientData] = useState({
    email: 'fadday@mail.ru',
    password: 'password'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Используем напрямую authService для логина
      const response = await authService.login(employeeData.email, employeeData.password);
      
      if (response.data && response.data.token) {
        const { token, user } = response.data;
        
        // Сохраняем токен в localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Устанавливаем токен для всех будущих запросов
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Обновляем контекст авторизации
        if (login) {
          login({ token, user });
        }
        
        navigate('/');
      } else {
        setError('Неверный ответ от сервера');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Неверный email или пароль');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Ошибка соединения с сервером');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/client-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('clientToken', data.token);
        localStorage.setItem('client', JSON.stringify(data.client));
        navigate('/client/dashboard');
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Ремонт Техники
          </Typography>
          <Typography component="h2" variant="h6" align="center" color="textSecondary" gutterBottom>
            Вход в систему
          </Typography>
          
          <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Сотрудник" />
            <Tab label="Клиент" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeTab === 0 && (
            <Box component="form" onSubmit={handleEmployeeLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email сотрудника"
                type="email"
                value={employeeData.email}
                onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Пароль"
                type="password"
                value={employeeData.password}
                onChange={(e) => setEmployeeData({...employeeData, password: e.target.value})}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Войти как сотрудник'}
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box component="form" onSubmit={handleClientLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email клиента"
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Пароль"
                type="password"
                value={clientData.password}
                onChange={(e) => setClientData({...clientData, password: e.target.value})}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Войти как клиент'}
              </Button>

              <Box textAlign="center" sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/client-register" variant="body2">
                  Нет аккаунта? Зарегистрируйтесь
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;