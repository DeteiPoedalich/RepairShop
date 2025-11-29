const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clientController = require('../controllers/clientController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Валидация
const clientValidation = [
  body('name').notEmpty().withMessage('Имя клиента обязательно'),
  body('phone').notEmpty().withMessage('Телефон клиента обязателен'),
  body('email').optional().isEmail().withMessage('Некорректный email')
];

// Маршруты
router.get('/', authenticateToken, clientController.getClients);
router.get('/:id', authenticateToken, clientController.getClientById);
router.get('/:id/orders', authenticateToken, clientController.getClientOrders);
router.post('/', authenticateToken, requireRole(['admin', 'manager']), clientValidation, clientController.createClient);
router.put('/:id', authenticateToken, requireRole(['admin', 'manager']), clientValidation, clientController.updateClient);

module.exports = router;