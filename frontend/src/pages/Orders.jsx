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
  Chip,
  IconButton,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (search) {
        params.search = search;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await orderService.getOrders(params);
      setOrders(response.data.orders || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, rowsPerPage, statusFilter]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadOrders();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Заказы на ремонт
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/orders/new')}
        >
          Новый заказ
        </Button>
      </Box>

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Поиск по клиентам или устройствам..."
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              label="Статус"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value={1}>Принят</MenuItem>
              <MenuItem value={2}>Диагностика</MenuItem>
              <MenuItem value={3}>Согласование</MenuItem>
              <MenuItem value={4}>В ремонте</MenuItem>
              <MenuItem value={5}>Готов</MenuItem>
              <MenuItem value={6}>Выдан</MenuItem>
              <MenuItem value={7}>Отменен</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Устройство</TableCell>
                <TableCell>Проблема</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Мастер</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Стоимость</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id_order} hover>
                  <TableCell>#{order.id_order}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {order.Client?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {order.Client?.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {order.Device?.Brand?.name} {order.Device?.model}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {order.Device?.DeviceType?.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {order.problem_description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[order.id_status] || 'Неизвестно'}
                      color={statusColors[order.id_status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.master?.name || 'Не назначен'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.date_created), 'dd.MM.yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {order.final_cost ? `${order.final_cost} ₽` : order.cost_estimate ? `${order.cost_estimate} ₽` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/orders/${order.id_order}`)}
                      title="Просмотреть детали"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {search || statusFilter ? 'Заказы не найдены' : 'Нет заказов'}
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
    </Container>
  );
};

export default Orders;