// middleware/clientAuth.js
const jwt = require('jsonwebtoken');
const { Client } = require('../models');

const authenticateClient = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    // Используем тот же секрет что и для обычных пользователей
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'repair_secret');
    
    // Ищем клиента по ID из токена
    const client = await Client.findByPk(decoded.clientId || decoded.id);
    
    if (!client) {
      return res.status(401).json({ error: 'Клиент не найден' });
    }

    req.client = client;
    next();
  } catch (error) {
    console.error('Ошибка аутентификации клиента:', error);
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

module.exports = { authenticateClient };