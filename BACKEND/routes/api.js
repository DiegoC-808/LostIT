const express = require('express');
const usersRoutes = require('./users');
const adminRoutes = require('./admin');
const publicacionesRoutes = require('./publicaciones');
const requestRoutes = require('./request');
const categoriasRoutes = require('./categorias');
const reportesRoutes = require('./reportes');
const usersController = require('../controllers/users_api_controller');

const routerApi = express.Router();

// LOGIN Y REGISTRO
routerApi.post('/api/login', usersController.login);
routerApi.post('/api/register', usersController.createUser);

routerApi.use('/api', usersRoutes);
routerApi.use('/api', publicacionesRoutes);
routerApi.use('/api', requestRoutes);
routerApi.use('/api', categoriasRoutes);
routerApi.use('/api', reportesRoutes);
routerApi.use('/api/admin', adminRoutes);

module.exports = routerApi;
