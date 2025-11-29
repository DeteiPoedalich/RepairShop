const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Маршруты для отчетов
router.get('/sales', authenticateToken, requireRole(['admin', 'manager']), reportController.getSalesReport);
router.get('/masters', authenticateToken, requireRole(['admin']), reportController.getMasterReport);
router.get('/device-types', authenticateToken, requireRole(['admin', 'manager']), reportController.getDeviceTypeReport);

module.exports = router;