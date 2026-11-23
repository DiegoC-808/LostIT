const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users_api_controller');
const { verifyToken, verifyAdmin } = usersController;


// User routes
router.get('/users', verifyToken, verifyAdmin, usersController.getUsers);
router.get('/users/:id', verifyToken, usersController.getUser);
router.post('/users', usersController.createUser);
router.put('/users/:id', verifyToken, usersController.updateUser);
router.delete('/users/:id', verifyToken, usersController.deleteUser);

module.exports = router;
