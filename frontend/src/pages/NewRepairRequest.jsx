import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const deviceTypes = [
  'Стиральная машина',
  'Холодильник',
  'Телевизор',
  'Посудомоечная машина',
  'Микроволновая печь',
  'Кофемашина',
  'Духовой шкаф',
  'Варочная панель',
  'Пылесос',
  'Кондиционер',
  'Другое'
];

const popularBrands = [
  'Samsung', 'LG', 'Bosch', 'Indesit', 'Ariston', 'Philips',
  'Sony', 'Panasonic', 'Whirlpool', 'Electrolux', 'Beko',
  'Haier', 'Hitachi', 'Sharp', 'Toshiba', 'Другой'
];

const NewRepairRequest = () => {
  const [formData, setFormData] = useState({
    device_type: '',
    device_brand: '',
    device_model: '',
    problem_description: '',
    contact_phone: '',
    contact_email: ''
  });
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const clientData = localStorage.getItem('client');
    if (clientData) {
      const client = JSON.parse(clientData);
      setClient(client);
      setFormData(prev => ({
        ...prev,
        contact_phone: client.phone,
        contact_email: client.email
      }));
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.device_type || !formData.device_brand || !formData.device_model || !formData.problem_description) {
      setError('Заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('clientToken');
      const response = await fetch('http://localhost:5000/api/repair-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Заявка успешно создана! Мы свяжемся с вами в ближайшее время.');
        setTimeout(() => {
          navigate('/client/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Ошибка при создании заявки');
      }
    } catch (error) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  if (!client) {
    return (
      <Container>
        <Alert severity="error">Требуется авторизация</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => navigate('/client/dashboard')} sx={{ mb: 2 }}>
          ← Назад к заявкам
        </Button>
        <Typography variant="h4" component="h1">
          Новая заявка на ремонт
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Тип устройства *</InputLabel>
                <Select
                  value={formData.device_type}
                  label="Тип устройства *"
                  onChange={(e) => handleChange('device_type', e.target.value)}
                >
                  {deviceTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Бренд *</InputLabel>
                <Select
                  value={formData.device_brand}
                  label="Бренд *"
                  onChange={(e) => handleChange('device_brand', e.target.value)}
                >
                  {popularBrands.map(brand => (
                    <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Модель устройства *"
                value={formData.device_model}
                onChange={(e) => handleChange('device_model', e.target.value)}
                placeholder="Например: WF60F4ECW2W"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Описание проблемы *"
                value={formData.problem_description}
                onChange={(e) => handleChange('problem_description', e.target.value)}
                placeholder="Подробно опишите, что случилось с устройством, какие есть симптомы..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Контактный телефон *"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Контактный email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/client/dashboard')}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Отправить заявку'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewRepairRequest;