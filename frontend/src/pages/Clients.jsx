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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { clientService, orderService } from '../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientOrders, setClientOrders] = useState([]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (search) {
        params.search = search;
      }

      const response = await clientService.getClients(params);
      const clientsData = response.data.clients || [];
      
      // Загружаем количество заказов для каждого клиента
      const clientsWithOrders = await Promise.all(
        clientsData.map(async (client) => {
          try {
            const ordersResponse = await orderService.getOrders({
              client: client.id_client,
              limit: 1 // Нам нужно только количество
            });
            return {
              ...client,
              ordersCount: ordersResponse.data.totalCount || 0
            };
          } catch (error) {
            return {
              ...client,
              ordersCount: 0
            };
          }
        })
      );

      setClients(clientsWithOrders);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientOrders = async (clientId) => {
    try {
      const response = await orderService.getOrders({
        client: clientId,
        limit: 100
      });
      setClientOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading client orders:', error);
      setClientOrders([]);
    }
  };

  useEffect(() => {
    loadClients();
  }, [page, rowsPerPage]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadClients();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    await loadClientOrders(client.id_client);
    setDialogOpen(true);
  };

  const getOrderCount = (client) => {
    return client.ordersCount || 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Клиенты
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Добавить модалку создания клиента */}}
        >
          Новый клиент
        </Button>
      </Box>

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Поиск по имени или телефону..."
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
                <TableCell>Имя</TableCell>
                <TableCell>Контактная информация</TableCell>
                <TableCell>Адрес</TableCell>
                <TableCell>Количество заказов</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id_client} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {client.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {client.phone}
                      </Typography>
                    </Box>
                    {client.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {client.email}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {client.address || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getOrderCount(client)}
                      color={getOrderCount(client) > 0 ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewClient(client)}
                      title="Просмотреть детали"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {search ? 'Клиенты не найдены' : 'Нет клиентов'}
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

      {/* Диалог просмотра клиента */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Детали клиента: {selectedClient?.name}
        </DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Информация о клиенте
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Телефон</Typography>
                    <Typography variant="body1">{selectedClient.phone}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{selectedClient.email || '—'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Адрес</Typography>
                    <Typography variant="body1">{selectedClient.address || '—'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Всего заказов</Typography>
                    <Chip
                      label={getOrderCount(selectedClient)}
                      color={getOrderCount(selectedClient) > 0 ? "primary" : "default"}
                      size="medium"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    История заказов
                  </Typography>
                  {clientOrders.length === 0 ? (
                    <Typography color="textSecondary">
                      У клиента пока нет заказов
                    </Typography>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {clientOrders.map((order) => (
                        <Paper key={order.id_order} sx={{ p: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle2">
                                Заказ #{order.id_order}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {order.Device?.Brand?.name} {order.Device?.model}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDate(order.date_created)}
                              </Typography>
                            </Box>
                            <Chip
                              label={order.OrderStatus?.name}
                              color={
                                order.id_status === 5 || order.id_status === 6 ? "success" : 
                                order.id_status === 7 ? "error" : "default"
                              }
                              size="small"
                            />
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Clients;