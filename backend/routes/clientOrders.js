const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authenticateClient } = require('../middleware/clientAuth');

// Маршруты для клиентов
router.get('/orders', authenticateClient, orderController.getMyOrders);

module.exports = router;