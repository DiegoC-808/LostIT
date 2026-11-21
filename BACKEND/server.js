const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const chalk = require('chalk');
const config = require('./config.js');
const router = require('./routes/api.js');
const createInitialData = require('./utils/initial_data.js');

const app = express();
const port = 3000;

app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));
app.use(express.json());
app.use(express.static('../FRONTEND'));
app.use(router);

// Conexión con la BD
let db = mongoose.connection;
db.on('connecting', () => {
    console.log(chalk.blue('Conectando a la base de datos...'));
});
db.on('connected', () => {
    console.log(chalk.green('¡Conectado a MongoDB Atlas!'));
    createInitialData();
});
db.on('error', (err) => {
    console.log(chalk.red('No se pudo conectar a la base de datos: ' + err.message));
});
mongoose.connect(config.mongoConnection);

app.listen(port, () => {
    console.log(chalk.yellow(`LostIT corriendo en http://localhost:${port}/views/login.html`));
});
