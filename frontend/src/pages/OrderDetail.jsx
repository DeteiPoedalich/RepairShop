import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [updateDialog, setUpdateDialog] = useState(false);

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

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(id);
      setOrder(response.data);
      setUpdateData({
        id_status: response.data.id_status,
        diagnosis: response.data.diagnosis || '',
        cost_estimate: response.data.cost_estimate || '',
        final_cost: response.data.final_cost || ''
      });
    } catch (error) {
      setError('Ошибка при загрузке заказа');
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await orderService.updateOrder(id, updateData);
      setUpdateDialog(false);
      loadOrder(); // Перезагружаем данные
    } catch (error) {
      setError('Ошибка при обновлении заказа');
    }
  };

  const getTotalServicesPrice = () => {
    if (!order?.services) return 0;
    return order.services.reduce((total, service) => {
      return total + (parseFloat(service.OrderService?.price || service.price) * (service.OrderService?.quantity || 1));
    }, 0);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <Alert severity="error">Заказ не найден</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/orders')}
        >
          Назад к заказам
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Заказ #{order.id_order}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setUpdateDialog(true)}
        >
          Редактировать
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
                <Chip
                  label={statusLabels[order.id_status] || 'Неизвестно'}
                  color={statusColors[order.id_status] || 'default'}
                  size="medium"
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                Создан: {format(new Date(order.date_created), 'dd MMMM yyyy HH:mm', { locale: ru })}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Клиент
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {order.Client?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  📞 {order.Client?.phone}
                </Typography>
                {order.Client?.email && (
                  <Typography variant="body2" color="textSecondary">
                    ✉️ {order.Client?.email}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Устройство
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {order.Device?.Brand?.name} {order.Device?.model}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {order.Device?.DeviceType?.name}
                </Typography>
                {order.Device?.serial_number && (
                  <Typography variant="body2" color="textSecondary">
                    Серийный номер: {order.Device?.serial_number}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Описание проблемы
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {order.problem_description}
                </Typography>
              </Grid>

              {order.diagnosis && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Диагностика
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {order.diagnosis}
                  </Typography>
                </Grid>
              )}

              {order.master && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Ответственный мастер
                  </Typography>
                  <Typography variant="body1">
                    {order.master?.name}
                  </Typography>
                </Grid>
              )}

              {order.date_completed && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Дата завершения
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(order.date_completed), 'dd MMMM yyyy', { locale: ru })}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Услуги */}
          {order.services && order.services.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Услуги
              </Typography>
              <Grid container spacing={2}>
                {order.services.map((service, index) => (
                  <Grid item xs={12} key={service.id_service}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle1" gutterBottom>
                              {service.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {service.description}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {service.OrderService?.price || service.price} ₽
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Стоимость и доп. информация */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>
              Стоимость
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Услуги:</Typography>
                <Typography variant="body2">{getTotalServicesPrice()} ₽</Typography>
              </Box>

              {order.cost_estimate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Предварительная стоимость:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {order.cost_estimate} ₽
                  </Typography>
                </Box>
              )}

              {order.final_cost && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Итоговая стоимость:</Typography>
                  <Typography variant="h6" color="primary">
                    {order.final_cost} ₽
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {order.warranty_until && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Гарантия до:
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(order.warranty_until), 'dd MMMM yyyy', { locale: ru })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Диалог редактирования */}
      <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать заказ</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={updateData.id_status}
                  label="Статус"
                  onChange={(e) => setUpdateData(prev => ({ ...prev, id_status: e.target.value }))}
                >
                  <MenuItem value={1}>Принят</MenuItem>
                  <MenuItem value={2}>Диагностика</MenuItem>
                  <MenuItem value={3}>Согласование</MenuItem>
                  <MenuItem value={4}>В ремонте</MenuItem>
                  <MenuItem value={5}>Готов</MenuItem>
                  <MenuItem value={6}>Выдан</MenuItem>
                  <MenuItem value={7}>Отменен</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Диагностика"
                value={updateData.diagnosis}
                onChange={(e) => setUpdateData(prev => ({ ...prev, diagnosis: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Предварительная стоимость"
                value={updateData.cost_estimate}
                onChange={(e) => setUpdateData(prev => ({ ...prev, cost_estimate: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Итоговая стоимость"
                value={updateData.final_cost}
                onChange={(e) => setUpdateData(prev => ({ ...prev, final_cost: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Отмена</Button>
          <Button onClick={handleUpdate} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;