const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const loginValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];

router.post('/login', loginValidation, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;