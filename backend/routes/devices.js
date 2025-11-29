const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const deviceController = require('../controllers/deviceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Валидация
const deviceValidation = [
  body('id_type').isInt({ min: 1 }).withMessage('Некорректный тип устройства'),
  body('id_brand').isInt({ min: 1 }).withMessage('Некорректный бренд'),
  body('model').notEmpty().withMessage('Модель устройства обязательна')
];

const deviceTypeValidation = [
  body('name').notEmpty().withMessage('Название типа обязательно')
];

const brandValidation = [
  body('name').notEmpty().withMessage('Название бренда обязательно')
];

// Маршруты
router.get('/', authenticateToken, deviceController.getDevices);
router.get('/types', authenticateToken, deviceController.getDeviceTypes);
router.get('/brands', authenticateToken, deviceController.getBrands);
router.get('/:id', authenticateToken, deviceController.getDeviceById);
router.post('/', authenticateToken, requireRole(['admin', 'manager']), deviceValidation, deviceController.createDevice);
router.post('/types', authenticateToken, requireRole(['admin']), deviceTypeValidation, deviceController.createDeviceType);
router.post('/brands', authenticateToken, requireRole(['admin']), brandValidation, deviceController.createBrand);
router.put('/:id', authenticateToken, requireRole(['admin', 'manager']), deviceValidation, deviceController.updateDevice);

module.exports = router;