const { Client, RepairOrder } = require('../models');
const { validationResult } = require('express-validator');

exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const where = {};
    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const clients = await Client.findAndCountAll({
      where,
      include: [{
        model: RepairOrder,
        attributes: ['id_order', 'date_created', 'id_status']
      }],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      clients: clients.rows,
      totalPages: Math.ceil(clients.count / parseInt(limit)),
      currentPage: parseInt(page),
      totalCount: clients.count
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке клиентов' });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{
        model: RepairOrder,
        include: ['Device', 'OrderStatus'],
        order: [['date_created', 'DESC']]
      }]
    });

    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, address } = req.body;

    // Проверяем, существует ли клиент с таким телефоном
    const existingClient = await Client.findOne({ where: { phone } });
    if (existingClient) {
      return res.status(400).json({ error: 'Клиент с таким телефоном уже существует' });
    }

    const client = await Client.create({
      name,
      phone,
      email,
      address
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Ошибка при создании клиента' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    const { name, phone, email, address } = req.body;

    // Проверяем, не занят ли телефон другим клиентом
    if (phone !== client.phone) {
      const existingClient = await Client.findOne({ where: { phone } });
      if (existingClient) {
        return res.status(400).json({ error: 'Клиент с таким телефоном уже существует' });
      }
    }

    await client.update({
      name,
      phone,
      email,
      address
    });

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении клиента' });
  }
};

exports.getClientOrders = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    const orders = await RepairOrder.findAll({
      where: { id_client: req.params.id },
      include: ['Device', 'OrderStatus', 'master'],
      order: [['date_created', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Get client orders error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке заказов клиента' });
  }
};