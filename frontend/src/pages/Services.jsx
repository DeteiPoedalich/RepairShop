import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { serviceService } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: 1
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (search) {
        params.search = search;
      }

      const response = await serviceService.getServices(params);
      setServices(response.data.services || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [page, rowsPerPage]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadServices();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_days: 1
    });
    setEditingService(null);
    setError('');
  };

  const handleCreateService = async () => {
    try {
      setError('');
      await serviceService.createService({
        ...formData,
        price: parseFloat(formData.price)
      });
      setDialogOpen(false);
      resetForm();
      setSuccess('Услуга успешно создана!');
      loadServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при создании услуги');
    }
  };

  const handleUpdateService = async () => {
    try {
      setError('');
      await serviceService.updateService(editingService.id_service, {
        ...formData,
        price: parseFloat(formData.price)
      });
      setDialogOpen(false);
      resetForm();
      setSuccess('Услуга успешно обновлена!');
      loadServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при обновлении услуги');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        await serviceService.deleteService(serviceId);
        setSuccess('Услуга успешно удалена!');
        loadServices();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.error || 'Ошибка при удалении услуги');
      }
    }
  };

  const handleEditClick = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration_days: service.duration_days || 1
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (editingService) {
      handleUpdateService();
    } else {
      handleCreateService();
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Услуги
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Новая услуга
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Поиск по названию услуги..."
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="outlined">
            Найти
          </Button>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Стоимость</TableCell>
                <TableCell>Длительность</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id_service} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {service.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {service.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      {service.price} ₽
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${service.duration_days} дн.`}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(service)}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteService(service.id_service)}
                      title="Удалить"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {search ? 'Услуги не найдены' : 'Нет услуг'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} из ${count}`
          }
        />
      </Paper>

      {/* Диалог создания/редактирования услуги */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Редактировать услугу' : 'Новая услуга'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название услуги *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Стоимость (₽) *"
                value={formData.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Длительность (дней)"
                value={formData.duration_days}
                onChange={(e) => handleFormChange('duration_days', parseInt(e.target.value) || 1)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">дн.</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.price}
          >
            {editingService ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Services;