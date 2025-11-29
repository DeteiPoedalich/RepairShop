const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clientAuthController = require('../controllers/clientAuthController');
const { authenticateClient } = require('../middleware/clientAuth');

const registerValidation = [
  body('name').notEmpty().withMessage('Имя обязательно'),
  body('phone').notEmpty().withMessage('Телефон обязателен'),
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов')
];

const loginValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];

router.post('/register', registerValidation, clientAuthController.register);
router.post('/login', loginValidation, clientAuthController.login);
router.get('/profile', authenticateClient, clientAuthController.getProfile);

module.exports = router;