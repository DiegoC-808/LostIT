const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request_api_controller');
const { verifyToken } = require('../controllers/users_api_controller');

// Request routes
router.get('/requests', verifyToken, requestController.getRequests);
router.post('/requests', verifyToken, requestController.createRequest);
router.put('/requests/:id', verifyToken, requestController.updateRequest);
router.delete('/requests/:id', verifyToken, requestController.deleteRequest);

module.exports = router;
