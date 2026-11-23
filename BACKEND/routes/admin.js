const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_api_controller');
const { verifyToken, verifyAdmin } = require('../controllers/users_api_controller');

// Admin routes
router.get('/dashboard', verifyToken, verifyAdmin, adminController.getDashboard);
router.post('/create-user', verifyToken, verifyAdmin, adminController.createUser);
router.put('/update-user/:id', verifyToken, verifyAdmin, adminController.updateUser);
router.delete('/delete-user/:id', verifyToken, verifyAdmin, adminController.deleteUser);

module.exports = router;
