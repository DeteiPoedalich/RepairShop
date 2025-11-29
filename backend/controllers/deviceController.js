const { Device, DeviceType, Brand, RepairOrder } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.getDevices = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, brand, search } = req.query;
    
    const where = {};
    if (type) where.id_type = type;
    if (brand) where.id_brand = brand;
    if (search) {
      where.model = {
        [Op.iLike]: `%${search}%`
      };
    }

    const devices = await Device.findAndCountAll({
      where,
      include: [
        { model: DeviceType },
        { model: Brand },
        {
          model: RepairOrder,
          attributes: ['id_order', 'date_created', 'id_status']
        }
      ],
      order: [['model', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      devices: devices.rows,
      totalPages: Math.ceil(devices.count / parseInt(limit)),
      currentPage: parseInt(page),
      totalCount: devices.count
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке устройств' });
  }
};

exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id, {
      include: [
        { model: DeviceType },
        { model: Brand },
        {
          model: RepairOrder,
          include: ['Client', 'OrderStatus'],
          order: [['date_created', 'DESC']]
        }
      ]
    });

    if (!device) {
      return res.status(404).json({ error: 'Устройство не найден' });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createDevice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id_type, id_brand, model, serial_number } = req.body;

    const device = await Device.create({
      id_type,
      id_brand,
      model,
      serial_number
    });

    const createdDevice = await Device.findByPk(device.id_device, {
      include: [DeviceType, Brand]
    });

    res.status(201).json(createdDevice);
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({ error: 'Ошибка при создании устройства' });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const device = await Device.findByPk(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Устройство не найден' });
    }

    const { id_type, id_brand, model, serial_number } = req.body;

    await device.update({
      id_type,
      id_brand,
      model,
      serial_number
    });

    const updatedDevice = await Device.findByPk(device.id_device, {
      include: [DeviceType, Brand]
    });

    res.json(updatedDevice);
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении устройства' });
  }
};

exports.getDeviceTypes = async (req, res) => {
  try {
    const deviceTypes = await DeviceType.findAll({
      order: [['name', 'ASC']]
    });
    res.json(deviceTypes);
  } catch (error) {
    console.error('Get device types error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке типов устройств' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      order: [['name', 'ASC']]
    });
    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке брендов' });
  }
};

exports.createDeviceType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const deviceType = await DeviceType.create({
      name,
      description
    });

    res.status(201).json(deviceType);
  } catch (error) {
    console.error('Create device type error:', error);
    res.status(500).json({ error: 'Ошибка при создании типа устройства' });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    const brand = await Brand.create({
      name
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Ошибка при создании бренда' });
  }
};