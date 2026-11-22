const bcrypt = require('bcrypt');
const User = require('../models/user');
const Publication = require('../models/publication');
const Request = require('../models/request');
const Report = require('../models/report');
const Category = require('../models/category');
const usersController = require('./users_api_controller');

exports.getDashboard = async (req, res) => {
    try {
        let users = await User.find();
        let publications = await Publication.find();
        let requests = await Request.find();
        let reports = await Report.find({ status: 'abierto' });
        let categories = await Category.find();
        res.json({
            totalUsers: users.length,
            totalPublications: publications.length,
            activePublications: publications.filter(p => p.status == 'activa').length,
            resolvedPublications: publications.filter(p => p.status == 'resuelta').length,
            hiddenPublications: publications.filter(p => p.status == 'oculta').length,
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.status == 'pendiente').length,
            openReports: reports.length,
            totalCategories: categories.length
        });
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.createUser = async (req, res) => {
    if (req.body == undefined || !req.body.name || !req.body.email || !req.body.password) {
        res.status(400).send('Nombre, correo y contraseña son obligatorios');
        return;
    }
    if (typeof req.body.name != 'string' || typeof req.body.email != 'string' || typeof req.body.password != 'string') {
        res.status(400).send('Los datos deben ser texto');
        return;
    }
    if (req.body.name.trim().length < 3) {
        res.status(400).send('El nombre debe tener al menos 3 caracteres');
        return;
    }
    if (!req.body.email.includes('@') || !req.body.email.includes('.')) {
        res.status(400).send('El correo no es válido');
        return;
    }
    if (req.body.password.length < 8) {
        res.status(400).send('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    let role = 'usuario';
    if (req.body.role != undefined) {
        if (req.body.role != 'usuario' && req.body.role != 'admin') {
            res.status(400).send('El rol solo puede ser usuario o admin');
            return;
        }
        role = req.body.role;
    }
    try {
        let exists = await User.findOne({ email: req.body.email.toLowerCase() });
        if (exists != null) {
            res.status(400).send('Ya existe una cuenta con ese correo');
            return;
        }
        let user = new User({
            name: req.body.name.trim(),
            email: req.body.email.toLowerCase(),
            password: bcrypt.hashSync(req.body.password, 10),
            role: role,
            avatar: '',
            created_at: new Date()
        });
        let doc = await user.save();
        res.status(201).json({ id: doc._id, name: doc.name, email: doc.email, role: doc.role });
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.updateUser = usersController.updateUser;

exports.deleteUser = usersController.deleteUser;
