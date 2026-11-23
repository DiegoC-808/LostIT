const bcrypt = require('bcrypt');
const chalk = require('chalk');
const config = require('../config.js');
const User = require('../models/user');
const Category = require('../models/category');

let categories = [
    { name: 'Electrónicos', description: 'Celulares, audífonos, cargadores, laptops' },
    { name: 'Documentos', description: 'Credenciales, INE, licencias, tarjetas' },
    { name: 'Llaves', description: 'Llaves de casa, de carro o de casillero' },
    { name: 'Mochilas y bolsas', description: 'Mochilas, bolsas, carteras y estuches' },
    { name: 'Ropa', description: 'Chamarras, sudaderas, gorras y lentes' },
    { name: 'Termos y botellas', description: 'Termos, botellas y loncheras' },
    { name: 'Otros', description: 'Lo que no entra en otra categoría' }
];

// Crea las categorías base y el usuario admin si todavía no existen en la BD
async function createInitialData() {
    try {
        for (let i = 0; i < categories.length; i++) {
            let exists = await Category.findOne({ name: categories[i].name });
            if (exists == null) {
                let category = new Category({
                    name: categories[i].name,
                    description: categories[i].description,
                    active: true
                });
                await category.save();
                console.log(chalk.blue('Categoría creada: ' + categories[i].name));
            }
        }
        let admin = await User.findOne({ email: config.adminEmail });
        if (admin == null) {
            let user = new User({
                name: 'Administrador LostIT',
                email: config.adminEmail,
                password: bcrypt.hashSync(config.adminPassword, 10),
                role: 'admin',
                avatar: '',
                created_at: new Date()
            });
            await user.save();
            console.log(chalk.blue('Administrador creado: ' + config.adminEmail));
        }
    } catch (err) {
        console.log(chalk.red('No se pudieron crear los datos iniciales: ' + err.message));
    }
}

module.exports = createInitialData;
