import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const [client, setClient] = useState(null);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const clientData = localStorage.getItem('client');
    if (clientData) {
      const clientObj = JSON.parse(clientData);
      setClient(clientObj);
      loadMyData(clientObj.id_client || clientObj.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadMyData = async (clientId) => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyRequests(),
        loadMyOrders(clientId)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      if (!token) {
        console.error('No client token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/repair-requests/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Error loading requests:', response.status);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadMyOrders = async (clientId) => {
  try {
    if (!clientId) {
      console.error('Client ID is undefined');
      return;
    }

    const token = localStorage.getItem('clientToken');
    if (!token) {
      console.error('No client token found');
      return;
    }

    // Используем новый endpoint
    const response = await fetch(`http://localhost:5000/api/client/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Orders response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Orders loaded:', data.orders);
      setOrders(data.orders || data);
    } else {
      const errorText = await response.text();
      console.error('Error loading orders:', response.status, errorText);
      
      // Если endpoint не работает, попробуем альтернативный способ
      await loadOrdersAlternative(token);
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    // Пробуем альтернативный способ
    await loadOrdersAlternative(localStorage.getItem('clientToken'));
  }
};

  // Альтернативный способ загрузки заказов через общий API
  const loadOrdersAlternative = async () => {
    try {
      const clientData = JSON.parse(localStorage.getItem('client'));
      const response = await fetch(`http://localhost:5000/api/repair-requests/my-requests`);
      
      if (response.ok) {
        const requests = await response.json();
        // Фильтруем только одобренные заявки (которые стали заказами)
        const approvedRequests = requests.filter(req => req.status === 'approved');
        setOrders(approvedRequests);
      }
    } catch (error) {
      console.error('Alternative orders loading failed:', error);
    }
  };

  // Остальные функции остаются без изменений...
  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getRequestStatusText = (status) => {
    switch (status) {
      case 'pending': return 'На рассмотрении';
      case 'approved': return 'Одобрена';
      case 'rejected': return 'Отклонена';
      default: return status;
    }
  };

  const getOrderStatusColor = (status) => {
    const statusMap = {
      1: 'default',    // Принят
      2: 'primary',    // Диагностика
      3: 'warning',    // Согласование
      4: 'info',       // В ремонте
      5: 'success',    // Готов
      6: 'secondary',  // Выдан
      7: 'error'       // Отменен
    };
    return statusMap[status] || 'default';
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      1: 'Принят',
      2: 'Диагностика',
      3: 'Согласование',
      4: 'В ремонте',
      5: 'Готов',
      6: 'Выдан',
      7: 'Отменен'
    };
    return statusMap[status] || 'Неизвестно';
  };

  const getOrderCost = (order) => {
    if (order.final_cost) return order.final_cost;
    if (order.cost_estimate) return order.cost_estimate;
    return '—';
  };

  const getDeviceInfo = (order) => {
    if (order.Device) {
      return `${order.Device.Brand?.name || ''} ${order.Device.model || ''}`.trim();
    }
    if (order.device_brand && order.device_model) {
      return `${order.device_brand} ${order.device_model}`;
    }
    return 'Устройство не указано';
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('client');
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!client) {
    return (
      <Container>
        <Alert severity="error">Требуется авторизация</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            Личный кабинет
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Добро пожаловать, {client.name}!
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/client/new-request')}
          >
            Новая заявка
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Выйти
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ваши данные
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>ID клиента:</strong> {client.id_client || client.id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Телефон:</strong> {client.phone}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Email:</strong> {client.email}
            </Typography>
            {client.address && (
              <Typography variant="body2" color="textSecondary">
                <strong>Адрес:</strong> {client.address}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Мои заказы" />
              <Tab label="Мои заявки" />
            </Tabs>
          </Paper>

          {activeTab === 0 ? (
            // Вкладка заказов
            <Box>
              <Typography variant="h6" gutterBottom>
                Мои заказы на ремонт
              </Typography>

              {orders.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    У вас пока нет заказов на ремонт
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Создайте заявку на ремонт, и мы преобразуем её в заказ после одобрения
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/client/new-request')}
                  >
                    Создать заявку
                  </Button>
                </Paper>
              ) : (
                orders.map((order) => (
                  <Card key={order.id_order || order.id_request} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">
                            {order.id_order ? `Заказ #${order.id_order}` : `Заявка #${order.id_request}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {getDeviceInfo(order)}
                          </Typography>
                        </Box>
                        <Chip
                          label={order.id_order ? 
                            getOrderStatusText(order.id_status || order.status) : 
                            getRequestStatusText(order.status)
                          }
                          color={order.id_order ? 
                            getOrderStatusColor(order.id_status || order.status) : 
                            getRequestStatusColor(order.status)
                          }
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Проблема:</strong> {order.problem_description}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Создан:</strong> {new Date(order.date_created || order.created_at).toLocaleDateString('ru-RU')}
                        </Typography>
                        {order.id_order && (
                          <Typography variant="h6" color="primary">
                            {getOrderCost(order)} ₽
                          </Typography>
                        )}
                      </Box>

                      {order.diagnosis && (
                        <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <strong>Диагностика:</strong> {order.diagnosis}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ) : (
            // Вкладка заявок
            <Box>
              <Typography variant="h6" gutterBottom>
                Мои заявки на ремонт
              </Typography>

              {requests.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    У вас пока нет заявок на ремонт
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/client/new-request')}
                    sx={{ mt: 2 }}
                  >
                    Создать первую заявку
                  </Button>
                </Paper>
              ) : (
                requests.map((request) => (
                  <Card key={request.id_request} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">
                            {request.device_brand} {request.device_model}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {request.device_type}
                          </Typography>
                        </Box>
                        <Chip
                          label={getRequestStatusText(request.status)}
                          color={getRequestStatusColor(request.status)}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {request.problem_description}
                      </Typography>
                      
                      <Typography variant="caption" color="textSecondary">
                        Создана: {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboard;