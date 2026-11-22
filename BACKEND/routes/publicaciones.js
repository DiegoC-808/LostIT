const express = require('express');
const router = express.Router();
const publicacionesController = require('../controllers/publicaciones_api_controller');
const { verifyToken } = require('../controllers/users_api_controller');

// Publicaciones routes
router.get('/publicaciones', verifyToken, publicacionesController.getPublicaciones);
router.get('/publicaciones/:id', verifyToken, publicacionesController.getPublicacion);
router.post('/publicaciones', verifyToken, publicacionesController.createPublicacion);
router.put('/publicaciones/:id', verifyToken, publicacionesController.updatePublicacion);
router.delete('/publicaciones/:id', verifyToken, publicacionesController.deletePublicacion);

module.exports = router;
