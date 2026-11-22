const express = require('express');
const usersRoutes = require('./users');
const publicacionesRoutes = require('./publicaciones');
const usersController = require('../controllers/users_api_controller');

const routerApi = express.Router();

// LOGIN Y REGISTRO
routerApi.post('/api/login', usersController.login);
routerApi.post('/api/register', usersController.createUser);

routerApi.use('/api', usersRoutes);
routerApi.use('/api', publicacionesRoutes);

module.exports = routerApi;
