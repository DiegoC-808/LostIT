const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes_api_controller');
const { verifyToken, verifyAdmin } = require('../controllers/users_api_controller');

// Reportes routes
router.get('/reportes', verifyToken, verifyAdmin, reportesController.getReportes);
router.post('/reportes', verifyToken, reportesController.createReporte);
router.put('/reportes/:id', verifyToken, verifyAdmin, reportesController.updateReporte);
router.delete('/reportes/:id', verifyToken, verifyAdmin, reportesController.deleteReporte);

module.exports = router;
