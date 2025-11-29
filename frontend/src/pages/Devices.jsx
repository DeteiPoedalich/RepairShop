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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { deviceService } from '../services/api';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    id_type: '',
    id_brand: '',
    model: '',
    serial_number: ''
  });

  const loadDevices = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (brandFilter) params.brand = brandFilter;

      const response = await deviceService.getDevices(params);
      setDevices(response.data.devices || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error loading devices:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceTypesAndBrands = async () => {
    try {
      const [typesRes, brandsRes] = await Promise.all([
        deviceService.getDeviceTypes(),
        deviceService.getBrands()
      ]);
      setDeviceTypes(typesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (error) {
      console.error('Error loading device types and brands:', error);
    }
  };

  useEffect(() => {
    loadDevices();
    loadDeviceTypesAndBrands();
  }, [page, rowsPerPage, typeFilter, brandFilter]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadDevices();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNewDeviceChange = (field, value) => {
    setNewDevice(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateDevice = async () => {
    try {
      await deviceService.createDevice(newDevice);
      setDialogOpen(false);
      setNewDevice({ id_type: '', id_brand: '', model: '', serial_number: '' });
      loadDevices();
    } catch (error) {
      console.error('Error creating device:', error);
    }
  };

  const getOrderCount = (device) => {
    return device.RepairOrders ? device.RepairOrders.length : 0;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Устройства
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Новое устройство
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по модели..."
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200, flexGrow: 1 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Тип</InputLabel>
            <Select
              value={typeFilter}
              label="Тип"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              {deviceTypes.map(type => (
                <MenuItem key={type.id_type} value={type.id_type}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Бренд</InputLabel>
            <Select
              value={brandFilter}
              label="Бренд"
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              {brands.map(brand => (
                <MenuItem key={brand.id_brand} value={brand.id_brand}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
                <TableCell>Модель</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Бренд</TableCell>
                <TableCell>Серийный номер</TableCell>
                <TableCell>Количество заказов</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id_device} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {device.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={device.DeviceType?.name} 
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {device.Brand?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {device.serial_number || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getOrderCount(device)}
                      color={getOrderCount(device) > 0 ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => {/* TODO: Просмотр деталей устройства */}}
                      title="Просмотреть детали"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => {/* TODO: Редактирование устройства */}}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {devices.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {search || typeFilter || brandFilter ? 'Устройства не найдены' : 'Нет устройств'}
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

      {/* Диалог создания устройства */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новое устройство</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
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

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Модель *"
                value={newDevice.model}
                onChange={(e) => handleNewDeviceChange('model', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Серийный номер"
                value={newDevice.serial_number}
                onChange={(e) => handleNewDeviceChange('serial_number', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateDevice} 
            variant="contained"
            disabled={!newDevice.id_type || !newDevice.id_brand || !newDevice.model}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Devices;