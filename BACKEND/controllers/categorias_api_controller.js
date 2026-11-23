const Category = require('../models/category');
const Publication = require('../models/publication');

exports.getCategorias = async (req, res) => {
    let filters = {};
    if (req.user.role != 'admin') {
        filters.active = true;
    }
    try {
        let docs = await Category.find(filters);
        docs.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            return 1;
        });
        res.json(docs);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.createCategoria = async (req, res) => {
    if (req.body == undefined || typeof req.body.name != 'string' || req.body.name.trim().length < 3) {
        res.status(400).send('El nombre de la categoría debe tener al menos 3 caracteres');
        return;
    }
    try {
        let exists = await Category.findOne({ name: req.body.name.trim() });
        if (exists != null) {
            res.status(400).send('Ya existe una categoría con ese nombre');
            return;
        }
        let category = new Category({
            name: req.body.name.trim(),
            description: req.body.description,
            active: true
        });
        let doc = await category.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.updateCategoria = async (req, res) => {
    if (req.body == undefined) {
        res.status(400).send('No mandaste nada para actualizar');
        return;
    }
    let object_to_update = {};
    let flag_updated = false;
    if (req.body.name != undefined) {
        if (typeof req.body.name != 'string' || req.body.name.trim().length < 3) {
            res.status(400).send('El nombre de la categoría debe tener al menos 3 caracteres');
            return;
        }
        object_to_update.name = req.body.name.trim();
        flag_updated = true;
    }
    if (req.body.description != undefined) {
        object_to_update.description = req.body.description;
        flag_updated = true;
    }
    if (req.body.active != undefined) {
        if (typeof req.body.active != 'boolean') {
            res.status(400).send('Activa debe ser true o false');
            return;
        }
        object_to_update.active = req.body.active;
        flag_updated = true;
    }
    if (!flag_updated) {
        res.status(400).send('No mandaste nada para actualizar');
        return;
    }
    try {
        if (object_to_update.name != undefined) {
            let exists = await Category.findOne({ name: object_to_update.name });
            if (exists != null && exists._id.toString() != req.params.id) {
                res.status(400).send('Ya existe una categoría con ese nombre');
                return;
            }
        }
        let doc = await Category.findByIdAndUpdate(req.params.id, object_to_update, { new: true });
        if (doc == null) {
            res.status(404).send('No existe la categoría');
            return;
        }
        res.json(doc);
    } catch (err) {
        res.status(400).send('El id de la categoría no es válido');
    }
}

exports.deleteCategoria = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (category == null) {
            res.status(404).send('No existe la categoría');
            return;
        }
        let used_in = await Publication.find({ category: req.params.id });
        if (used_in.length > 0) {
            res.status(400).send('No se puede eliminar: la usan ' + used_in.length + ' publicaciones. Mejor desactívala');
            return;
        }
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Categoría eliminada', category: category });
    } catch (err) {
        res.status(400).send('El id de la categoría no es válido');
    }
}
