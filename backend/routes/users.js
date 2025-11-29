const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Валидация
const userValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  body('role').isIn(['admin', 'master', 'manager']).withMessage('Некорректная роль'),
  body('name').notEmpty().withMessage('Имя обязательно'),
  body('phone').optional().isMobilePhone().withMessage('Некорректный телефон')
];

const userUpdateValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  body('role').isIn(['admin', 'master', 'manager']).withMessage('Некорректная роль'),
  body('name').notEmpty().withMessage('Имя обязательно'),
  body('phone').optional().isMobilePhone().withMessage('Некорректный телефон')
];

// Маршруты
router.get('/', authenticateToken, requireRole(['admin']), userController.getUsers);
router.get('/:id', authenticateToken, requireRole(['admin']), userController.getUserById);
router.post('/', authenticateToken, requireRole(['admin']), userValidation, userController.createUser);
router.put('/:id', authenticateToken, requireRole(['admin']), userUpdateValidation, userController.updateUser);
router.delete('/:id', authenticateToken, requireRole(['admin']), userController.deleteUser);

module.exports = router;