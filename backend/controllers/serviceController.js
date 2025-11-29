const { Service, OrderService } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const where = {};
    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const services = await Service.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      services: services.rows,
      totalPages: Math.ceil(services.count / parseInt(limit)),
      currentPage: parseInt(page),
      totalCount: services.count
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке услуг' });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [{
        model: OrderService,
        include: ['RepairOrder']
      }]
    });

    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, duration_days } = req.body;

    const service = await Service.create({
      name,
      description,
      price,
      duration_days
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Ошибка при создании услуги' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    const { name, description, price, duration_days } = req.body;

    await service.update({
      name,
      description,
      price,
      duration_days
    });

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении услуги' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    // Проверяем, используется ли услуга в заказах
    const usedInOrders = await OrderService.findOne({
      where: { id_service: req.params.id }
    });

    if (usedInOrders) {
      return res.status(400).json({ 
        error: 'Невозможно удалить услугу, так как она используется в заказах' 
      });
    }

    await service.destroy();

    res.json({ message: 'Услуга успешно удалена' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Ошибка при удалении услуги' });
  }
};