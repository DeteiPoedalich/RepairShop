import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  Assignment as OrdersIcon,
  Person as ClientsIcon,
  Computer as DevicesIcon,
  Build as ServicesIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { orderService, clientService, deviceService, serviceService } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalClients: 0,
    totalDevices: 0,
    totalServices: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const [ordersRes, clientsRes, devicesRes, servicesRes] = await Promise.all([
          orderService.getOrders({ page: 1, limit: 5 }),
          clientService.getClients({ page: 1, limit: 1 }),
          deviceService.getDevices({ page: 1, limit: 1 }),
          serviceService.getServices({ page: 1, limit: 1 })
        ]);

        setStats({
          totalOrders: ordersRes.data.totalCount || 0,
          totalClients: clientsRes.data.totalCount || 0,
          totalDevices: devicesRes.data.totalCount || 0,
          totalServices: servicesRes.data.totalCount || 0,
          recentOrders: ordersRes.data.orders || []
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statusColors = {
    1: 'default', // Принят
    2: 'primary', // Диагностика
    3: 'warning', // Согласование
    4: 'info',    // В ремонте
    5: 'success', // Готов
    6: 'secondary', // Выдан
    7: 'error'    // Отменен
  };

  const statusLabels = {
    1: 'Принят',
    2: 'Диагностика',
    3: 'Согласование',
    4: 'В ремонте',
    5: 'Готов',
    6: 'Выдан',
    7: 'Отменен'
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Дашборд
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего заказов"
            value={stats.totalOrders}
            icon={<OrdersIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Клиенты"
            value={stats.totalClients}
            icon={<ClientsIcon fontSize="large" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Устройства"
            value={stats.totalDevices}
            icon={<DevicesIcon fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Услуги"
            value={stats.totalServices}
            icon={<ServicesIcon fontSize="large" />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingIcon />
              Последние заказы
            </Typography>
            
            {stats.recentOrders.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                Нет заказов
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {stats.recentOrders.map((order) => (
                  <Box
                    key={order.id_order}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Заказ #{order.id_order}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {order.Client?.name} • {order.Device?.Brand?.name} {order.Device?.model}
                        </Typography>
                      </Box>
                      <Chip
                        label={statusLabels[order.id_status] || 'Неизвестно'}
                        color={statusColors[order.id_status] || 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {order.problem_description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(order.date_created), 'dd MMMM yyyy', { locale: ru })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Быстрые действия
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                • Создать новый заказ
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Добавить клиента
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Просмотреть отчеты
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;