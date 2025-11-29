import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService, clientService, deviceService, serviceService } from '../services/api';

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Данные для форм
  const [clients, setClients] = useState([]);
  const [devices, setDevices] = useState([]);
  const [services, setServices] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [brands, setBrands] = useState([]);

  // Форма заказа
  const [formData, setFormData] = useState({
    client_id: '',
    device_id: '',
    problem_description: '',
    services: []
  });

  // Форма нового клиента
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Форма нового устройства
  const [newDevice, setNewDevice] = useState({
    id_type: '',
    id_brand: '',
    model: '',
    serial_number: ''
  });

  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewDevice, setShowNewDevice] = useState(false);
  const [fromRequest, setFromRequest] = useState(null);

  useEffect(() => {
    // Проверяем авторизацию перед загрузкой данных
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadInitialData();
    
    if (location.state?.fromRequest) {
      const request = location.state.fromRequest;
      setFromRequest(request);
      prefillFormFromRequest(request);
    }
  }, [location, navigate]);

  const prefillFormFromRequest = async (request) => {
    console.log('Prefilling form from request:', request);
    
    try {
      // Проверяем авторизацию
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Требуется авторизация');
        navigate('/login');
        return;
      }

      // Ищем существующего клиента по телефону или email
      let client = clients.find(c => 
        (request.contact_phone && c.phone === request.contact_phone) || 
        (request.contact_email && c.email === request.contact_email)
      );
      
      // Если клиент не найден, создаем нового с правильной структурой данных
      if (!client) {
        console.log('Creating new client from request data:', {
          name: request.Client?.name,
          phone: request.contact_phone,
          email: request.contact_email
        });

        // Подготавливаем данные клиента с валидацией
        const clientData = {
          name: request.Client?.name?.trim() || `Клиент ${request.contact_phone || 'без имени'}`,
          phone: request.contact_phone?.trim() || '',
          email: request.contact_email?.trim() || (request.contact_phone ? `${request.contact_phone}@temp.com` : 'unknown@temp.com'),
          address: request.address?.trim() || 'Адрес не указан'
        };

        // Валидация обязательных полей
        if (!clientData.phone) {
          throw new Error('Недостаточно данных для создания клиента: отсутствует телефон');
        }

        if (!clientData.name || clientData.name.length < 2) {
          clientData.name = `Клиент ${clientData.phone}`;
        }

        // Проверяем email
        if (!clientData.email.includes('@')) {
          clientData.email = `${clientData.phone}@temp.com`;
        }

        console.log('Sending client data to API:', clientData);
        
        try {
          const clientResponse = await clientService.createClient(clientData);
          client = clientResponse.data;
          setClients(prev => [...prev, client]);
          console.log('Client created successfully:', client);
        } catch (clientError) {
          console.error('Error creating client:', clientError);
          
          // Если ошибка создания клиента, пробуем найти снова (возможно создался параллельно)
          const refreshedClients = await clientService.getClients({ page: 1, limit: 100 });
          setClients(refreshedClients.data.clients || []);
          
          client = refreshedClients.data.clients.find(c => 
            (request.contact_phone && c.phone === request.contact_phone) || 
            (request.contact_email && c.email === request.contact_email)
          );
          
          if (!client) {
            throw new Error(`Не удалось создать клиента: ${clientError.response?.data?.error || clientError.message}`);
          }
        }
      }

      // Ищем существующее устройство
      let device = devices.find(d => 
        d.model === request.device_model && 
        d.Brand?.name === request.device_brand
      );

      // Если устройство не найдено, создаем новое
      if (!device && request.device_model && request.device_brand) {
        console.log('Creating new device from request data:', {
          model: request.device_model,
          brand: request.device_brand,
          type: request.device_type
        });

        // Находим или создаем тип устройства
        let deviceType = deviceTypes.find(t => t.name === request.device_type);
        if (!deviceType && request.device_type) {
          try {
            const typeResponse = await deviceService.createDeviceType({
              name: request.device_type,
              description: `Тип устройства для ${request.device_brand}`
            });
            deviceType = typeResponse.data;
            setDeviceTypes(prev => [...prev, deviceType]);
          } catch (typeError) {
            console.warn('Не удалось создать тип устройства:', typeError);
            // Используем первый доступный тип или создаем базовый
            deviceType = deviceTypes[0];
            if (!deviceType) {
              const defaultTypeResponse = await deviceService.createDeviceType({
                name: 'Другое',
                description: 'Тип устройства по умолчанию'
              });
              deviceType = defaultTypeResponse.data;
              setDeviceTypes(prev => [...prev, deviceType]);
            }
          }
        }

        // Находим или создаем бренд
        let brand = brands.find(b => b.name === request.device_brand);
        if (!brand && request.device_brand) {
          try {
            const brandResponse = await deviceService.createBrand({
              name: request.device_brand
            });
            brand = brandResponse.data;
            setBrands(prev => [...prev, brand]);
          } catch (brandError) {
            console.warn('Не удалось создать бренд:', brandError);
            // Используем первый доступный бренд или создаем базовый
            brand = brands[0];
            if (!brand) {
              const defaultBrandResponse = await deviceService.createBrand({
                name: 'Другой'
              });
              brand = defaultBrandResponse.data;
              setBrands(prev => [...prev, brand]);
            }
          }
        }

        if (deviceType && brand) {
          try {
            const deviceResponse = await deviceService.createDevice({
              id_type: deviceType.id_type,
              id_brand: brand.id_brand,
              model: request.device_model || 'Модель не указана',
              serial_number: request.serial_number || ''
            });
            device = deviceResponse.data;
            setDevices(prev => [...prev, device]);
            console.log('Device created successfully:', device);
          } catch (deviceError) {
            console.error('Error creating device:', deviceError);
            throw new Error(`Не удалось создать устройство: ${deviceError.response?.data?.error || deviceError.message}`);
          }
        }
      }

      // Заполняем форму данными
      if (client && device) {
        setFormData({
          client_id: client.id_client,
          device_id: device.id_device,
          problem_description: request.problem_description || 'Описание проблемы не указано',
          services: []
        });
        setSuccess('Данные из заявки автоматически заполнены!');
      } else {
        setError('Не удалось создать необходимые данные для заказа');
      }
    } catch (error) {
      console.error('Error pre-filling form:', error);
      
      // Более детальная обработка ошибок
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        // Парсим ошибку валидации
        const errorData = error.response.data;
        if (errorData.errors) {
          // Если есть детали ошибок валидации
          const validationErrors = Object.values(errorData.errors).join(', ');
          setError(`Ошибка валидации данных: ${validationErrors}`);
        } else {
          setError(`Ошибка в данных: ${errorData.error || 'неверный формат данных'}`);
        }
      } else {
        setError(`Ошибка при заполнении данных из заявки: ${error.message || 'неизвестная ошибка'}`);
      }
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clientsRes, devicesRes, servicesRes, typesRes, brandsRes] = await Promise.all([
        clientService.getClients({ page: 1, limit: 100 }),
        deviceService.getDevices({ page: 1, limit: 100 }),
        serviceService.getServices({ page: 1, limit: 100 }),
        deviceService.getDeviceTypes(),
        deviceService.getBrands()
      ]);

      setClients(clientsRes.data.clients || []);
      setDevices(devicesRes.data.devices || []);
      setServices(servicesRes.data.services || []);
      setDeviceTypes(typesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Ошибка при загрузке данных');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const services = [...prev.services];
      const index = services.indexOf(serviceId);
      
      if (index > -1) {
        services.splice(index, 1);
      } else {
        services.push(serviceId);
      }
      
      return { ...prev, services };
    });
  };

  const handleNewClientChange = (field, value) => {
    setNewClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewDeviceChange = (field, value) => {
    setNewDevice(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createNewClient = async () => {
    try {
      // Валидация
      if (!newClient.name.trim() || !newClient.phone.trim()) {
        setError('Заполните обязательные поля: имя и телефон');
        return;
      }

      const clientData = {
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email || `${newClient.phone}@client.com`,
        address: newClient.address || 'Не указан'
      };

      const response = await clientService.createClient(clientData);
      setClients(prev => [...prev, response.data]);
      setFormData(prev => ({ ...prev, client_id: response.data.id_client }));
      setShowNewClient(false);
      setNewClient({ name: '', phone: '', email: '', address: '' });
      setSuccess('Клиент успешно создан!');
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Ошибка при создании клиента: ' + 
        (error.response?.data?.error || error.message || 'неизвестная ошибка'));
    }
  };

  const createNewDevice = async () => {
    try {
      if (!newDevice.id_type || !newDevice.id_brand || !newDevice.model.trim()) {
        setError('Заполните обязательные поля: тип, бренд и модель');
        return;
      }

      const response = await deviceService.createDevice({
        id_type: newDevice.id_type,
        id_brand: newDevice.id_brand,
        model: newDevice.model,
        serial_number: newDevice.serial_number || ''
      });
      
      setDevices(prev => [...prev, response.data]);
      setFormData(prev => ({ ...prev, device_id: response.data.id_device }));
      setShowNewDevice(false);
      setNewDevice({ id_type: '', id_brand: '', model: '', serial_number: '' });
      setSuccess('Устройство успешно создано!');
    } catch (error) {
      console.error('Error creating device:', error);
      setError('Ошибка при создании устройства: ' + 
        (error.response?.data?.error || error.message || 'неизвестная ошибка'));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.client_id || !formData.device_id || !formData.problem_description.trim()) {
    setError('Заполните обязательные поля: клиент, устройство и описание проблемы');
    return;
  }

  try {
    setSubmitting(true);
    setError('');
    
    // ПРАВИЛЬНАЯ СТРУКТУРА ДАННЫХ
    const orderData = {
      client_id: parseInt(formData.client_id),
      device_id: parseInt(formData.device_id),
      problem_description: formData.problem_description,
      services: formData.services.map(id => parseInt(id)) // Преобразуем в числа
    };

    console.log('Sending order data:', orderData);
    
    const response = await orderService.createOrder(orderData);
    console.log('Order created successfully:', response.data);
    
    setSuccess('Заказ успешно создан!');
    setTimeout(() => {
      navigate('/orders');
    }, 2000);
    
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error response:', error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    } else if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors.map(err => err.msg).join(', ');
        setError(`Ошибка валидации: ${validationErrors}`);
      } else {
        setError(`Ошибка при создании заказа: ${errorData.error || 'неверные данные'}`);
      }
    } else {
      setError(error.response?.data?.error || 'Ошибка при создании заказа');
    }
  } finally {
    setSubmitting(false);
  }
};

  const getSelectedServices = () => {
    return services.filter(service => formData.services.includes(service.id_service));
  };

  const getTotalPrice = () => {
    return getSelectedServices().reduce((total, service) => total + parseFloat(service.price || 0), 0);
  };

  const clearFromRequest = () => {
    setFromRequest(null);
    setFormData({
      client_id: '',
      device_id: '',
      problem_description: '',
      services: []
    });
    setSuccess('Данные из заявки очищены');
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Новый заказ на ремонт
          {fromRequest && (
            <Chip 
              label="Создается из заявки" 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        {fromRequest && (
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearFromRequest}
          >
            Очистить данные заявки
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {fromRequest && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Данные из заявки #{fromRequest.id_request}
                </Typography>
                <Typography variant="body2">
                  Клиент: {fromRequest.Client?.name} | 
                  Устройство: {fromRequest.device_brand} {fromRequest.device_model} | 
                  Тип: {fromRequest.device_type}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Выбор клиента */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Клиент *</InputLabel>
                  <Select
                    value={formData.client_id}
                    label="Клиент *"
                    onChange={(e) => handleFormChange('client_id', e.target.value)}
                  >
                    {clients.map(client => (
                      <MenuItem key={client.id_client} value={client.id_client}>
                        {client.name} - {client.phone}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  onClick={() => setShowNewClient(!showNewClient)}
                  startIcon={<AddIcon />}
                >
                  Новый клиент
                </Button>
              </Box>

              {showNewClient && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Новый клиент
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Имя *"
                          value={newClient.name}
                          onChange={(e) => handleNewClientChange('name', e.target.value)}
                          error={!newClient.name.trim()}
                          helperText={!newClient.name.trim() ? "Обязательное поле" : ""}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Телефон *"
                          value={newClient.phone}
                          onChange={(e) => handleNewClientChange('phone', e.target.value)}
                          error={!newClient.phone.trim()}
                          helperText={!newClient.phone.trim() ? "Обязательное поле" : ""}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={newClient.email}
                          onChange={(e) => handleNewClientChange('email', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Адрес"
                          value={newClient.address}
                          onChange={(e) => handleNewClientChange('address', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={createNewClient}
                          disabled={!newClient.name.trim() || !newClient.phone.trim()}
                        >
                          Создать клиента
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Выбор устройства */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Устройство *</InputLabel>
                  <Select
                    value={formData.device_id}
                    label="Устройство *"
                    onChange={(e) => handleFormChange('device_id', e.target.value)}
                  >
                    {devices.map(device => (
                      <MenuItem key={device.id_device} value={device.id_device}>
                        {device.Brand?.name} {device.model} ({device.DeviceType?.name})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  onClick={() => setShowNewDevice(!showNewDevice)}
                  startIcon={<AddIcon />}
                >
                  Новое устройство
                </Button>
              </Box>

              {showNewDevice && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Новое устройство
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Тип устройства *</InputLabel>
                          <Select
                            value={newDevice.id_type}
                            label="Тип устройства *"
                            onChange={(e) => handleNewDeviceChange('id_type', e.target.value)}
                          >
                            {deviceTypes.map(type => (
                              <MenuItem key={type.id_type} value={type.id_type}>
                                {type.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Бренд *</InputLabel>
                          <Select
                            value={newDevice.id_brand}
                            label="Бренд *"
                            onChange={(e) => handleNewDeviceChange('id_brand', e.target.value)}
                          >
                            {brands.map(brand => (
                              <MenuItem key={brand.id_brand} value={brand.id_brand}>
                                {brand.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Модель *"
                          value={newDevice.model}
                          onChange={(e) => handleNewDeviceChange('model', e.target.value)}
                          error={!newDevice.model.trim()}
                          helperText={!newDevice.model.trim() ? "Обязательное поле" : ""}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Серийный номер"
                          value={newDevice.serial_number}
                          onChange={(e) => handleNewDeviceChange('serial_number', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={createNewDevice}
                          disabled={!newDevice.id_type || !newDevice.id_brand || !newDevice.model.trim()}
                        >
                          Создать устройство
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Описание проблемы */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Описание проблемы *"
                value={formData.problem_description}
                onChange={(e) => handleFormChange('problem_description', e.target.value)}
                error={!formData.problem_description.trim()}
                helperText={!formData.problem_description.trim() ? "Обязательное поле" : ""}
              />
            </Grid>

            {/* Выбор услуг */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Услуги
              </Typography>
              <Grid container spacing={2}>
                {services.map(service => (
                  <Grid item xs={12} sm={6} md={4} key={service.id_service}>
                    <Card 
                      variant={formData.services.includes(service.id_service) ? "elevated" : "outlined"}
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.services.includes(service.id_service) ? '2px solid' : '1px solid',
                        borderColor: formData.services.includes(service.id_service) ? 'primary.main' : 'divider'
                      }}
                      onClick={() => handleServiceToggle(service.id_service)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {service.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {service.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {service.price} ₽
                          </Typography>
                          <Chip 
                            label={formData.services.includes(service.id_service) ? "Выбрано" : "Выбрать"}
                            color={formData.services.includes(service.id_service) ? "primary" : "default"}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Итоговая стоимость */}
            {formData.services.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Предварительная стоимость
                    </Typography>
                    <Typography variant="h4">
                      {getTotalPrice()} ₽
                    </Typography>
                    <Typography variant="body2">
                      Выбрано услуг: {formData.services.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Кнопки отправки */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/orders')}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {submitting ? 'Создание...' : 'Создать заказ'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewOrder;