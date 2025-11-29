const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const repairRequestController = require('../controllers/repairRequestController');
const { authenticateClient } = require('../middleware/clientAuth');
const { authenticateToken, requireRole } = require('../middleware/auth');

const requestValidation = [
  body('device_type').notEmpty().withMessage('Тип устройства обязателен'),
  body('device_brand').notEmpty().withMessage('Бренд устройства обязателен'),
  body('device_model').notEmpty().withMessage('Модель устройства обязательна'),
  body('problem_description').notEmpty().withMessage('Описание проблемы обязательно'),
  body('contact_phone').notEmpty().withMessage('Контактный телефон обязателен')
];

const statusValidation = [
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Некорректный статус')
];

// Маршруты для клиентов
router.post('/', authenticateClient, requestValidation, repairRequestController.createRequest);
router.get('/my-requests', authenticateClient, repairRequestController.getMyRequests);
router.get('/my-requests/:id', authenticateClient, repairRequestController.getRequestById);

// Маршруты для сотрудников
router.get('/', authenticateToken, requireRole(['admin', 'employee']), repairRequestController.getAllRequests);
router.put('/:id/status', authenticateToken, requireRole(['admin', 'employee']), statusValidation, repairRequestController.updateRequestStatus);

module.exports = router;