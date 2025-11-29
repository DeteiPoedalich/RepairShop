const { RepairOrder, Client, Device, DeviceType, Brand, OrderStatus, Service, OrderService, User } = require('../models');
const { validationResult } = require('express-validator');

exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      client_id,
      device_id,
      problem_description,
      services
    } = req.body;

    const order = await RepairOrder.create({
      client_id,
      device_id,
      problem_description,
      id_status: 1, // Принят
      id_master: req.user.id_user
    });

    if (services && services.length > 0) {
      const orderServices = services.map(service_id => ({
        id_order: order.id_order,
        id_service: service_id
      }));
      await OrderService.bulkCreate(orderServices);
    }

    const createdOrder = await RepairOrder.findByPk(order.id_order, {
      include: [
        { model: Client },
        { model: Device, include: [DeviceType, Brand] },
        { model: OrderStatus },
        { model: Service, as: 'services' },
        { model: User, as: 'master' }
      ]
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
};
exports.getMyOrders = async (req, res) => {
  try {
    console.log('getMyOrders called, client:', req.client);
    
    // Получаем клиента из middleware
    const clientId = req.client?.id_client;
    
    if (!clientId) {
      return res.status(401).json({ error: 'Неавторизованный доступ' });
    }

    const orders = await RepairOrder.findAll({
      where: { client_id: clientId },
      include: [
        { model: Client },
        { model: Device, include: [DeviceType, Brand] },
        { model: OrderStatus },
        { model: Service, as: 'services' }
      ],
      order: [['date_created', 'DESC']]
    });

    console.log(`Found ${orders.length} orders for client ${clientId}`);
    
    res.json({
      orders: orders,
      totalCount: orders.length
    });
  } catch (error) {
    console.error('Get client orders error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке заказов' });
  }
};
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search, client } = req.query;
    
    const where = {};
    if (status) {
      where.id_status = status;
    }
    if (client) {
      where.id_client = client;
    }

    const orders = await RepairOrder.findAndCountAll({
      where,
      include: [
        { model: Client },
        { model: Device, include: [DeviceType, Brand] },
        { model: OrderStatus },
        { model: Service, as: 'services' },
        { model: User, as: 'master' }
      ],
      order: [['date_created', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      orders: orders.rows,
      totalPages: Math.ceil(orders.count / parseInt(limit)),
      currentPage: parseInt(page),
      totalCount: orders.count
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке заказов' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await RepairOrder.findByPk(req.params.id, {
      include: [
        { model: Client },
        { model: Device, include: [DeviceType, Brand] },
        { model: OrderStatus },
        { model: Service, as: 'services' },
        { model: User, as: 'master' }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await RepairOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    const {
      id_status,
      diagnosis,
      cost_estimate,
      final_cost,
      warranty_until
    } = req.body;

    // Подготавливаем данные для обновления
    const updateData = {};
    
    if (id_status !== undefined) updateData.id_status = id_status;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (cost_estimate !== undefined) updateData.cost_estimate = cost_estimate;
    if (final_cost !== undefined) updateData.final_cost = final_cost;
    if (warranty_until !== undefined) updateData.warranty_until = warranty_until;

    // Если статус меняется на "Готов" или "Выдан", устанавливаем дату завершения
    if ((id_status === 5 || id_status === 6) && !order.date_completed) {
      updateData.date_completed = new Date();
    }

    await order.update(updateData);

    const updatedOrder = await RepairOrder.findByPk(order.id_order, {
      include: [
        { model: Client },
        { model: Device, include: [DeviceType, Brand] },
        { model: OrderStatus },
        { model: Service, as: 'services' },
        { model: User, as: 'master' }
      ]
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении заказа' });
  }
};