const { RepairRequest, Client } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.createRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      device_type,
      device_brand,
      device_model,
      problem_description,
      contact_phone,
      contact_email
    } = req.body;

    const request = await RepairRequest.create({
      id_client: req.client.id_client,
      device_type,
      device_brand,
      device_model,
      problem_description,
      contact_phone,
      contact_email: contact_email || req.client.email
    });

    const createdRequest = await RepairRequest.findByPk(request.id_request, {
      include: [{ model: Client }]
    });

    res.status(201).json(createdRequest);
  } catch (error) {
    console.error('Create repair request error:', error);
    res.status(500).json({ error: 'Ошибка при создании заявки' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await RepairRequest.findAll({
      where: { id_client: req.client.id_client },
      include: [{ model: Client }],
      order: [['created_at', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке заявок' });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await RepairRequest.findOne({
      where: { 
        id_request: req.params.id,
        id_client: req.client.id_client 
      },
      include: [{ model: Client }]
    });

    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Для сотрудников - просмотр всех заявок
exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const requests = await RepairRequest.findAndCountAll({
      where,
      include: [{ model: Client }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      requests: requests.rows,
      totalPages: Math.ceil(requests.count / parseInt(limit)),
      currentPage: parseInt(page),
      totalCount: requests.count
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке заявок' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const request = await RepairRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    await request.update({ status });

    const updatedRequest = await RepairRequest.findByPk(request.id_request, {
      include: [{ model: Client }]
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса заявки' });
  }
};