const Publication = require('../models/publication');
const Category = require('../models/category');
const Request = require('../models/request');
const Report = require('../models/report');
const paginate = require('../utils/paginate');

async function categoryExists(id) {
    try {
        let category = await Category.findById(id);
        return category != null && category.active;
    } catch (err) {
        return false;
    }
}

exports.getPublicaciones = async (req, res) => {
    let filters = {};
    if (req.query.type) {
        filters.type = req.query.type;
    }
    if (req.query.category) {
        filters.category = req.query.category;
    }
    if (req.query.mine == 'true') {
        filters.owner = req.user.id;
    } else if (req.user.role != 'admin') {
        filters.status = 'activa';
    } else if (req.query.status) {
        filters.status = req.query.status;
    }
    try {
        let docs = await Publication.find(filters);
        // La búsqueda por texto no distingue mayúsculas: "aud" encuentra "Audífonos"
        if (req.query.search) {
            let search = req.query.search.toLowerCase();
            docs = docs.filter(doc => doc.title.toLowerCase().includes(search));
        }
        if (req.query.location) {
            let location = req.query.location.toLowerCase();
            docs = docs.filter(doc => doc.location.toLowerCase().includes(location));
        }
        if (req.query.sort == 'oldest') {
            docs.sort((a, b) => a.created_at - b.created_at);
        } else {
            docs.sort((a, b) => b.created_at - a.created_at);
        }
        res.json(paginate(docs, req.query));
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.getPublicacion = async (req, res) => {
    try {
        let publication = await Publication.findById(req.params.id);
        if (publication == null) {
            res.status(404).send('No existe la publicación');
            return;
        }
        if (publication.status == 'oculta' && publication.owner != req.user.id && req.user.role != 'admin') {
            res.status(404).send('No existe la publicación');
            return;
        }
        res.json(publication);
    } catch (err) {
        res.status(400).send('El id de la publicación no es válido');
    }
}

exports.createPublicacion = async (req, res) => {
    if (req.body == undefined) {
        res.status(400).send('Faltan los datos de la publicación');
        return;
    }
    let { type, title, description, category, location, date, images } = req.body;
    if (!type || !title || !description || !category || !location || !date) {
        res.status(400).send('Tipo, título, descripción, categoría, ubicación y fecha son obligatorios');
        return;
    }
    if (typeof title != 'string' || typeof description != 'string' || typeof location != 'string') {
        res.status(400).send('Los datos deben ser texto');
        return;
    }
    if (type != 'perdido' && type != 'encontrado') {
        res.status(400).send('El tipo solo puede ser perdido o encontrado');
        return;
    }
    if (title.trim().length < 3) {
        res.status(400).send('El título debe tener al menos 3 caracteres');
        return;
    }
    if (images == undefined) {
        images = [];
    }
    if (images.length > 3) {
        res.status(400).send('Una publicación puede tener máximo 3 imágenes');
        return;
    }
    if (!(await categoryExists(category))) {
        res.status(400).send('La categoría no existe');
        return;
    }
    try {
        let publication = new Publication({
            type: type,
            title: title.trim(),
            description: description,
            category: category,
            location: location,
            date: date,
            images: images,
            owner: req.user.id,
            owner_name: req.user.name,
            status: 'activa',
            created_at: new Date()
        });
        let doc = await publication.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.updatePublicacion = async (req, res) => {
    if (req.body == undefined) {
        res.status(400).send('No mandaste nada para actualizar');
        return;
    }
    try {
        let publication = await Publication.findById(req.params.id);
        if (publication == null) {
            res.status(404).send('No existe la publicación');
            return;
        }
        let is_owner = publication.owner == req.user.id;
        let is_admin = req.user.role == 'admin';
        if (!is_owner && !is_admin) {
            res.status(403).send('Solo el dueño puede editar esta publicación');
            return;
        }
        // De una publicación ajena, el admin solo puede cambiar el estado (ocultarla o mostrarla)
        if (!is_owner && (req.body.type != undefined || req.body.title != undefined || req.body.description != undefined || req.body.category != undefined || req.body.location != undefined || req.body.date != undefined || req.body.images != undefined)) {
            res.status(403).send('El administrador solo puede cambiar el estado de una publicación ajena');
            return;
        }
        let object_to_update = {};
        let flag_updated = false;
        if (req.body.type != undefined) {
            if (req.body.type != 'perdido' && req.body.type != 'encontrado') {
                res.status(400).send('El tipo solo puede ser perdido o encontrado');
                return;
            }
            let pending = await Request.find({ publication: req.params.id, status: 'pendiente' });
            if (req.body.type != publication.type && pending.length > 0) {
                res.status(400).send('No se puede cambiar el tipo: la publicación tiene solicitudes pendientes');
                return;
            }
            object_to_update.type = req.body.type;
            flag_updated = true;
        }
        if (req.body.title != undefined) {
            if (typeof req.body.title != 'string' || req.body.title.trim().length < 3) {
                res.status(400).send('El título debe tener al menos 3 caracteres');
                return;
            }
            object_to_update.title = req.body.title.trim();
            flag_updated = true;
        }
        if (req.body.description != undefined) {
            object_to_update.description = req.body.description;
            flag_updated = true;
        }
        if (req.body.category != undefined) {
            if (!(await categoryExists(req.body.category))) {
                res.status(400).send('La categoría no existe');
                return;
            }
            object_to_update.category = req.body.category;
            flag_updated = true;
        }
        if (req.body.location != undefined) {
            object_to_update.location = req.body.location;
            flag_updated = true;
        }
        if (req.body.date != undefined) {
            object_to_update.date = req.body.date;
            flag_updated = true;
        }
        if (req.body.images != undefined) {
            if (req.body.images.length > 3) {
                res.status(400).send('Una publicación puede tener máximo 3 imágenes');
                return;
            }
            object_to_update.images = req.body.images;
            flag_updated = true;
        }
        if (req.body.status != undefined) {
            if (req.body.status != 'activa' && req.body.status != 'resuelta' && req.body.status != 'oculta') {
                res.status(400).send('El estado solo puede ser activa, resuelta u oculta');
                return;
            }
            if (!is_admin && (req.body.status == 'oculta' || publication.status == 'oculta')) {
                res.status(403).send('Solo el administrador puede ocultar o mostrar publicaciones');
                return;
            }
            if (!is_admin && publication.status == 'resuelta' && req.body.status != 'resuelta') {
                res.status(400).send('La publicación ya está resuelta');
                return;
            }
            object_to_update.status = req.body.status;
            flag_updated = true;
        }
        if (!flag_updated) {
            res.status(400).send('No mandaste nada para actualizar');
            return;
        }
        let doc = await Publication.findByIdAndUpdate(req.params.id, object_to_update, { new: true });
        res.json(doc);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.deletePublicacion = async (req, res) => {
    try {
        let publication = await Publication.findById(req.params.id);
        if (publication == null) {
            res.status(404).send('No existe la publicación');
            return;
        }
        if (publication.owner != req.user.id && req.user.role != 'admin') {
            res.status(403).send('Solo el dueño puede eliminar esta publicación');
            return;
        }
        await Request.deleteMany({ publication: req.params.id });
        await Report.deleteMany({ publication: req.params.id });
        await Publication.findByIdAndDelete(req.params.id);
        res.json({ message: 'Publicación eliminada', publication: publication });
    } catch (err) {
        res.status(400).send('El id de la publicación no es válido');
    }
}
