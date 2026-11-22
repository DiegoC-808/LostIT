const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config.js');
const User = require('../models/user');
const Publication = require('../models/publication');
const Request = require('../models/request');
const Report = require('../models/report');
const paginate = require('../utils/paginate');

function userToJson(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        created_at: user.created_at
    };
}

function createToken(user) {
    return jwt.sign({ id: user._id, name: user.name, role: user.role }, config.secretKey, { expiresIn: '1h' });
}

function validEmail(email) {
    return email.includes('@') && email.includes('.');
}

// MIDDLEWARES DE AUTENTICACION
exports.verifyToken = (req, res, next) => {
    let token = req.get('Authorization');
    if (token == undefined) {
        res.status(401).send('Necesitas iniciar sesión');
        return;
    }
    jwt.verify(token, config.secretKey, (err, decoded) => {
        if (err) {
            res.status(401).send('Tu sesión expiró, vuelve a iniciar sesión');
            return;
        }
        req.user = decoded;
        next();
    });
}

exports.verifyAdmin = (req, res, next) => {
    if (req.user.role != 'admin') {
        res.status(403).send('Solo el administrador puede hacer esto');
        return;
    }
    next();
}

// LOGIN
exports.login = async (req, res) => {
    if (req.body == undefined || !req.body.email || !req.body.password) {
        res.status(400).send('Escribe tu correo y tu contraseña');
        return;
    }
    try {
        let user = await User.findOne({ email: req.body.email.toLowerCase() });
        if (user == null || !bcrypt.compareSync(req.body.password, user.password)) {
            res.status(401).send('Correo o contraseña incorrectos');
            return;
        }
        res.json({ token: createToken(user), user: userToJson(user) });
    } catch (err) {
        res.status(400).send(err.message);
    }
}

// REGISTRO
exports.createUser = async (req, res) => {
    if (req.body == undefined) {
        res.status(400).send('Faltan los datos del usuario');
        return;
    }
    let { name, email, password, confirm_password } = req.body;
    if (!name || !email || !password || !confirm_password) {
        res.status(400).send('Completa todos los campos');
        return;
    }
    if (typeof name != 'string' || typeof email != 'string' || typeof password != 'string' || typeof confirm_password != 'string') {
        res.status(400).send('Los datos deben ser texto');
        return;
    }
    if (name.trim().length < 3) {
        res.status(400).send('El nombre debe tener al menos 3 caracteres');
        return;
    }
    if (!validEmail(email)) {
        res.status(400).send('El correo no es válido');
        return;
    }
    if (password.length < 8) {
        res.status(400).send('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    if (password != confirm_password) {
        res.status(400).send('Las contraseñas no coinciden');
        return;
    }
    try {
        let exists = await User.findOne({ email: email.toLowerCase() });
        if (exists != null) {
            res.status(400).send('Ya existe una cuenta con ese correo');
            return;
        }
        let user = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            password: bcrypt.hashSync(password, 10),
            role: 'usuario',
            avatar: '',
            created_at: new Date()
        });
        let doc = await user.save();
        res.status(201).json({ token: createToken(doc), user: userToJson(doc) });
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.getUsers = async (req, res) => {
    try {
        let docs = await User.find();
        if (req.query.search) {
            let search = req.query.search.toLowerCase();
            docs = docs.filter(user => user.name.toLowerCase().includes(search));
        }
        let users = [];
        for (let i = 0; i < docs.length; i++) {
            users.push(userToJson(docs[i]));
        }
        res.json(paginate(users, req.query));
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.getUser = async (req, res) => {
    if (req.params.id != req.user.id && req.user.role != 'admin') {
        res.status(403).send('Solo puedes ver tu propio perfil');
        return;
    }
    try {
        let user = await User.findById(req.params.id);
        if (user == null) {
            res.status(404).send('No existe el usuario');
            return;
        }
        res.json(userToJson(user));
    } catch (err) {
        res.status(400).send('El id del usuario no es válido');
    }
}

exports.updateUser = async (req, res) => {
    if (req.params.id != req.user.id && req.user.role != 'admin') {
        res.status(403).send('Solo puedes editar tu propio perfil');
        return;
    }
    if (req.body == undefined) {
        res.status(400).send('No mandaste nada para actualizar');
        return;
    }
    let object_to_update = {};
    let flag_updated = false;
    if (req.body.name != undefined) {
        if (typeof req.body.name != 'string' || req.body.name.trim().length < 3) {
            res.status(400).send('El nombre debe tener al menos 3 caracteres');
            return;
        }
        object_to_update.name = req.body.name.trim();
        flag_updated = true;
    }
    if (req.body.email != undefined) {
        if (typeof req.body.email != 'string' || !validEmail(req.body.email)) {
            res.status(400).send('El correo no es válido');
            return;
        }
        object_to_update.email = req.body.email.toLowerCase();
        flag_updated = true;
    }
    if (req.body.avatar != undefined) {
        object_to_update.avatar = req.body.avatar;
        flag_updated = true;
    }
    if (req.body.password != undefined) {
        if (typeof req.body.password != 'string' || req.body.password.length < 8) {
            res.status(400).send('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        object_to_update.password = bcrypt.hashSync(req.body.password, 10);
        flag_updated = true;
    }
    if (req.body.role != undefined) {
        if (req.user.role != 'admin') {
            res.status(403).send('Solo el administrador puede cambiar el rol');
            return;
        }
        if (req.params.id == req.user.id) {
            res.status(400).send('No puedes cambiar tu propio rol');
            return;
        }
        if (req.body.role != 'usuario' && req.body.role != 'admin') {
            res.status(400).send('El rol solo puede ser usuario o admin');
            return;
        }
        object_to_update.role = req.body.role;
        flag_updated = true;
    }
    if (!flag_updated) {
        res.status(400).send('No mandaste nada para actualizar');
        return;
    }
    try {
        if (object_to_update.email != undefined) {
            let exists = await User.findOne({ email: object_to_update.email });
            if (exists != null && exists._id.toString() != req.params.id) {
                res.status(400).send('Ya existe una cuenta con ese correo');
                return;
            }
        }
        let user = await User.findByIdAndUpdate(req.params.id, object_to_update, { new: true });
        if (user == null) {
            res.status(404).send('No existe el usuario');
            return;
        }
        res.json(userToJson(user));
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.deleteUser = async (req, res) => {
    if (req.params.id != req.user.id && req.user.role != 'admin') {
        res.status(403).send('Solo puedes eliminar tu propia cuenta');
        return;
    }
    try {
        let user = await User.findById(req.params.id);
        if (user == null) {
            res.status(404).send('No existe el usuario');
            return;
        }
        if (req.user.role != 'admin') {
            if (req.body == undefined || !req.body.password || !bcrypt.compareSync(req.body.password, user.password)) {
                res.status(401).send('La contraseña es incorrecta');
                return;
            }
        }
        let id = user._id.toString();
        let publications = await Publication.find({ owner: id });
        for (let i = 0; i < publications.length; i++) {
            await Request.deleteMany({ publication: publications[i]._id.toString() });
            await Report.deleteMany({ publication: publications[i]._id.toString() });
        }
        await Publication.deleteMany({ owner: id });
        await Request.deleteMany({ requester: id });
        await Report.deleteMany({ reporter: id });
        await User.findByIdAndDelete(id);
        res.json({ message: 'Cuenta eliminada', user: userToJson(user) });
    } catch (err) {
        res.status(400).send('El id del usuario no es válido');
    }
}
