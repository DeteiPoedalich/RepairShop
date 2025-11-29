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
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    phone: ''
  });

  const roleColors = {
    admin: 'error',
    master: 'warning',
    manager: 'primary'
  };

  const roleLabels = {
    admin: 'Администратор',
    master: 'Мастер',
    manager: 'Менеджер'
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'manager',
      phone: ''
    });
    setEditingUser(null);
    setError('');
  };

  const handleCreateUser = async () => {
    try {
      setError('');
      await userService.createUser(formData);
      setDialogOpen(false);
      resetForm();
      setSuccess('Пользователь успешно создан!');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при создании пользователя');
    }
  };

  const handleUpdateUser = async () => {
    try {
      setError('');
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await userService.updateUser(editingUser.id_user, updateData);
      setDialogOpen(false);
      resetForm();
      setSuccess('Пользователь успешно обновлен!');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при обновлении пользователя');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser.id_user) {
      setError('Нельзя удалить собственный аккаунт');
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${userName}?`)) {
      try {
        await userService.deleteUser(userId);
        setSuccess('Пользователь успешно удален!');
        loadUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.error || 'Ошибка при удалении пользователя');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || ''
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (editingUser) {
      handleUpdateUser();
    } else {
      handleCreateUser();
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Пользователи
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Новый пользователь
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id_user} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {user.name}
                      {user.id_user === currentUser.id_user && (
                        <Chip 
                          label="Вы" 
                          size="small" 
                          color="info" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {user.phone || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roleLabels[user.role]}
                      color={roleColors[user.role]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(user)}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(user.id_user, user.name)}
                      disabled={user.id_user === currentUser.id_user}
                      title={user.id_user === currentUser.id_user ? "Нельзя удалить себя" : "Удалить"}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      Нет пользователей
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог создания/редактирования пользователя */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Имя *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editingUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}
                type="password"
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Роль *</InputLabel>
                <Select
                  value={formData.role}
                  label="Роль *"
                  onChange={(e) => handleFormChange('role', e.target.value)}
                >
                  <MenuItem value="manager">Менеджер</MenuItem>
                  <MenuItem value="master">Мастер</MenuItem>
                  <MenuItem value="admin">Администратор</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.email || (!editingUser && !formData.password)}
          >
            {editingUser ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;