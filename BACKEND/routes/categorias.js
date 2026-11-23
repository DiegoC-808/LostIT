const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias_api_controller');
const { verifyToken, verifyAdmin } = require('../controllers/users_api_controller');

// Categorias routes
router.get('/categorias', verifyToken, categoriasController.getCategorias);
router.post('/categorias', verifyToken, verifyAdmin, categoriasController.createCategoria);
router.put('/categorias/:id', verifyToken, verifyAdmin, categoriasController.updateCategoria);
router.delete('/categorias/:id', verifyToken, verifyAdmin, categoriasController.deleteCategoria);

module.exports = router;
