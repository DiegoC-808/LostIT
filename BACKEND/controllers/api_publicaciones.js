const express = require('express');
const router = express.Router();
const publicacionesController = require('./api_publicaciones');

// Publicaciones routes
router.get('/publicaciones', publicacionesController.getPublicaciones);
router.post('/publicaciones', publicacionesController.createPublicacion);
router.put('/publicaciones/:id', publicacionesController.updatePublicacion);
router.delete('/publicaciones/:id', publicacionesController.deletePublicacion);