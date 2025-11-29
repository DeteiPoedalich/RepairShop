const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/OrderController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { authenticateClient } = require('../middleware/clientAuth');
// Валидация
const orderValidation = [
  body('client_id').isInt({ min: 1 }).withMessage('Некорректный ID клиента'),
  body('device_id').isInt({ min: 1 }).withMessage('Некорректный ID устройства'),
  body('problem_description').notEmpty().withMessage('Описание проблемы обязательно')
];

const updateOrderValidation = [
  body('id_status').optional().isInt({ min: 1 }).withMessage('Некорректный статус'),
  body('cost_estimate').optional().isFloat({ min: 0 }).withMessage('Некорректная стоимость'),
  body('final_cost').optional().isFloat({ min: 0 }).withMessage('Некорректная итоговая стоимость')
];

// Маршруты
router.get('/', authenticateToken, orderController.getOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.post('/', authenticateToken, requireRole(['admin', 'manager', 'master']), orderValidation, orderController.createOrder);
router.put('/:id', authenticateToken, requireRole(['admin', 'master']), updateOrderValidation, orderController.updateOrder);
router.get('/client/orders', authenticateClient, orderController.getMyOrders);

module.exports = router;