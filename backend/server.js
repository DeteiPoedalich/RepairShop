const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const clientRoutes = require('./routes/clients');
const deviceRoutes = require('./routes/devices');
const serviceRoutes = require('./routes/services');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const clientAuthRoutes = require('./routes/clientAuth');
const repairRequestRoutes = require('./routes/repairRequests');
const clientOrdersRoutes = require('./routes/clientOrders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/client-auth', clientAuthRoutes);
app.use('/api/client', clientOrdersRoutes);
app.use('/api/repair-requests', repairRequestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    return res.status(400).json({ 
      error: 'Ошибка валидации',
      details: errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ 
      error: 'Нарушение уникальности',
      message: 'Запись с такими данными уже существует'
    });
  }

  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к БД установлено');
    
    // Синхронизация моделей с БД
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development'
    });
    console.log('✅ Модели синхронизированы с БД');
    
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📊 База данных: ${process.env.DB_NAME || 'repair_shop'}`);
      console.log(`🌍 Окружение: ${process.env.NODE_ENV}`);
      console.log(`🔗 API доступно по: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();