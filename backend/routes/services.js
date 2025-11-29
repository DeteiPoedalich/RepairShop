const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Валидация
const serviceValidation = [
  body('name').notEmpty().withMessage('Название услуги обязательно'),
  body('price').isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
  body('duration_days').optional().isInt({ min: 1 }).withMessage('Длительность должна быть положительным числом')
];

// Маршруты
router.get('/', authenticateToken, serviceController.getServices);
router.get('/:id', authenticateToken, serviceController.getServiceById);
router.post('/', authenticateToken, requireRole(['admin']), serviceValidation, serviceController.createService);
router.put('/:id', authenticateToken, requireRole(['admin']), serviceValidation, serviceController.updateService);
router.delete('/:id', authenticateToken, requireRole(['admin']), serviceController.deleteService);

module.exports = router;