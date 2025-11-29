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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const RepairRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };

  const statusLabels = {
    pending: 'На рассмотрении',
    approved: 'Одобрена',
    rejected: 'Отклонена'
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = `http://localhost:5000/api/repair-requests?page=${page + 1}&limit=${rowsPerPage}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        setTotalCount(data.totalCount || 0);
      } else {
        setError('Ошибка загрузки заявок');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, rowsPerPage, statusFilter]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/repair-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess(`Статус заявки изменен на "${statusLabels[newStatus]}"`);
        loadRequests(); // Перезагружаем список
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка изменения статуса');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCreateOrder = (request) => {
  navigate('/orders/new', { 
    state: { 
      fromRequest: request 
    } 
  });
};

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Заявки на ремонт от клиентов
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            label="Статус"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Все заявки</MenuItem>
            <MenuItem value="pending">На рассмотрении</MenuItem>
            <MenuItem value="approved">Одобренные</MenuItem>
            <MenuItem value="rejected">Отклоненные</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Устройство</TableCell>
                <TableCell>Проблема</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id_request} hover>
                  <TableCell>#{request.id_request}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {request.Client?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {request.Client?.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {request.device_brand} {request.device_model}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {request.device_type}
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
                      {request.problem_description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.contact_phone}
                    </Typography>
                    {request.contact_email && (
                      <Typography variant="body2" color="textSecondary">
                        {request.contact_email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[request.status]}
                      color={statusColors[request.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(request.created_at)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(request)}
                        title="Просмотреть детали"
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {request.status === 'pending' && (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => handleStatusChange(request.id_request, 'approved')}
                            title="Одобрить заявку"
                            size="small"
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleStatusChange(request.id_request, 'rejected')}
                            title="Отклонить заявку"
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                      
                      {request.status === 'approved' && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleCreateOrder(request)}
                        >
                          Создать заказ
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              
              {requests.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {statusFilter ? 'Заявки не найдены' : 'Нет заявок на ремонт'}
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

      {/* Диалог просмотра деталей заявки */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Детали заявки #{selectedRequest?.id_request}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Клиент</Typography>
                  <Typography variant="body1">{selectedRequest.Client?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Телефон</Typography>
                  <Typography variant="body1">{selectedRequest.contact_phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{selectedRequest.contact_email || selectedRequest.Client?.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Статус</Typography>
                  <Chip
                    label={statusLabels[selectedRequest.status]}
                    color={statusColors[selectedRequest.status]}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Устройство</Typography>
                  <Typography variant="body1">
                    {selectedRequest.device_brand} {selectedRequest.device_model} ({selectedRequest.device_type})
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Описание проблемы</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRequest.problem_description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Дата создания</Typography>
                  <Typography variant="body1">{formatDate(selectedRequest.created_at)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Дата обновления</Typography>
                  <Typography variant="body1">{formatDate(selectedRequest.updated_at)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Закрыть</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                color="success" 
                onClick={() => {
                  handleStatusChange(selectedRequest.id_request, 'approved');
                  setDialogOpen(false);
                }}
              >
                Одобрить
              </Button>
              <Button 
                color="error" 
                onClick={() => {
                  handleStatusChange(selectedRequest.id_request, 'rejected');
                  setDialogOpen(false);
                }}
              >
                Отклонить
              </Button>
            </>
          )}
          {selectedRequest?.status === 'approved' && (
            <Button 
              color="primary" 
              onClick={() => {
                handleCreateOrder(selectedRequest);
                setDialogOpen(false);
              }}
            >
              Создать заказ
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RepairRequests;