const express = require('express');
const router = express.Router();
const adminController = require('./api_admin');

// Admin routes
router.get('/dashboard', adminController.getDashboard);
router.post('/create-user', adminController.createUser);
router.put('/update-user/:id', adminController.updateUser);
router.delete('/delete-user/:id', adminController.deleteUser);

module.exports = router;   
