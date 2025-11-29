const { Client } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const generateClientToken = (clientId) => {
  return jwt.sign({ clientId }, process.env.JWT_SECRET || 'repair_secret', { 
    expiresIn: '30d' 
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, password, address } = req.body;

    console.log('🔐 Регистрация клиента:', { name, email, phone });

    // Проверяем, существует ли клиент с таким email или телефоном
    const existingClient = await Client.findOne({
      where: {
        [Op.or]: [{ email }, { phone }]
      }
    });

    if (existingClient) {
      return res.status(400).json({ 
        error: 'Клиент с таким email или телефоном уже существует' 
      });
    }

    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    const client = await Client.create({
      name,
      phone,
      email,
      password_hash: passwordHash,
      address,
      is_verified: true // Для упрощения
    });

    const token = generateClientToken(client.id_client);

    console.log('✅ Клиент зарегистрирован:', client.id_client);

    res.status(201).json({
      token,
      client: {
        id: client.id_client,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address
      }
    });
  } catch (error) {
    console.error('❌ Ошибка регистрации клиента:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('🔐 Попытка входа клиента:', email);

    const client = await Client.findOne({ where: { email } });
    
    if (!client) {
      console.log('❌ Клиент не найден:', email);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    console.log('👤 Найден клиент:', client.id_client);

    const isValidPassword = await bcrypt.compare(password, client.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Неверный пароль для клиента:', email);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = generateClientToken(client.id_client);

    console.log('✅ Успешный вход клиента:', client.id_client);

    res.json({
      token,
      client: {
        id: client.id_client,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address
      }
    });
  } catch (error) {
    console.error('❌ Ошибка входа клиента:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const client = await Client.findByPk(req.client.id_client, {
      attributes: { exclude: ['password_hash', 'verification_token'] }
    });

    res.json(client);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};