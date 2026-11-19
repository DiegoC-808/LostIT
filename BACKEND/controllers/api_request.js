const express = require('express');
const router = express.Router();
const requestController = require('./api_request');

// Request routes
router.get('/requests', requestController.getRequests);
router.post('/requests', requestController.createRequest);
router.put('/requests/:id', requestController.updateRequest);
router.delete('/requests/:id', requestController.deleteRequest);

module.exports = router;