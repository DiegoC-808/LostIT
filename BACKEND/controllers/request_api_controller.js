const Request = require('../models/request');
const Publication = require('../models/publication');
const paginate = require('../utils/paginate');

exports.getRequests = async (req, res) => {
    let filters = {};
    if (req.query.box == 'received') {
        filters.owner = req.user.id;
    } else if (req.query.box == 'all' && req.user.role == 'admin') {
        filters = {};
    } else {
        filters.requester = req.user.id;
    }
    if (req.query.status) {
        filters.status = req.query.status;
    }
    try {
        let docs = await Request.find(filters);
        docs.sort((a, b) => b.created_at - a.created_at);
        res.json(paginate(docs, req.query));
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.createRequest = async (req, res) => {
    if (req.body == undefined || !req.body.publication || !req.body.message) {
        res.status(400).send('Elige la publicación y escribe un mensaje');
        return;
    }
    if (typeof req.body.message != 'string') {
        res.status(400).send('Los datos deben ser texto');
        return;
    }
    if (req.body.message.trim().length < 10) {
        res.status(400).send('Explica en al menos 10 caracteres por qué el objeto es tuyo');
        return;
    }
    try {
        let publication = await Publication.findById(req.body.publication);
        if (publication == null || publication.status != 'activa') {
            res.status(404).send('La publicación no existe o ya no está disponible');
            return;
        }
        if (publication.type != 'encontrado') {
            res.status(400).send('Solo se pueden reclamar objetos encontrados');
            return;
        }
        if (publication.owner == req.user.id) {
            res.status(400).send('No puedes reclamar tu propia publicación');
            return;
        }
        let pending = await Request.findOne({
            publication: req.body.publication,
            requester: req.user.id,
            status: 'pendiente'
        });
        if (pending != null) {
            res.status(400).send('Ya tienes una solicitud pendiente para este objeto');
            return;
        }
        let request = new Request({
            publication: req.body.publication,
            publication_title: publication.title,
            requester: req.user.id,
            requester_name: req.user.name,
            owner: publication.owner,
            message: req.body.message.trim(),
            status: 'pendiente',
            created_at: new Date()
        });
        let doc = await request.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.updateRequest = async (req, res) => {
    if (req.body == undefined || (req.body.status == undefined && req.body.message == undefined)) {
        res.status(400).send('Manda el nuevo estado o el nuevo mensaje');
        return;
    }
    try {
        let request = await Request.findById(req.params.id);
        if (request == null) {
            res.status(404).send('No existe la solicitud');
            return;
        }
        if (request.status != 'pendiente') {
            res.status(400).send('La solicitud ya fue ' + request.status);
            return;
        }
        let object_to_update = {};
        if (req.body.status != undefined) {
            if (request.owner != req.user.id) {
                res.status(403).send('Solo el dueño de la publicación puede aceptar o rechazar');
                return;
            }
            if (req.body.status != 'aceptada' && req.body.status != 'rechazada') {
                res.status(400).send('El estado solo puede ser aceptada o rechazada');
                return;
            }
            if (req.body.status == 'aceptada') {
                let publication = await Publication.findById(request.publication);
                if (publication == null || publication.status != 'activa') {
                    res.status(400).send('La publicación ya no está activa');
                    return;
                }
            }
            object_to_update.status = req.body.status;
        }
        if (req.body.message != undefined) {
            if (request.requester != req.user.id) {
                res.status(403).send('Solo quien envió la solicitud puede cambiar el mensaje');
                return;
            }
            if (typeof req.body.message != 'string' || req.body.message.trim().length < 10) {
                res.status(400).send('Explica en al menos 10 caracteres por qué el objeto es tuyo');
                return;
            }
            object_to_update.message = req.body.message.trim();
        }
        let doc = await Request.findByIdAndUpdate(req.params.id, object_to_update, { new: true });
        if (doc.status == 'aceptada') {
            await Publication.findByIdAndUpdate(doc.publication, { status: 'resuelta' });
            // Las demás solicitudes pendientes de ese objeto se rechazan
            let others = await Request.find({ publication: doc.publication, status: 'pendiente' });
            for (let i = 0; i < others.length; i++) {
                await Request.findByIdAndUpdate(others[i]._id, { status: 'rechazada' });
            }
        }
        res.json(doc);
    } catch (err) {
        res.status(400).send('El id de la solicitud no es válido');
    }
}

exports.deleteRequest = async (req, res) => {
    try {
        let request = await Request.findById(req.params.id);
        if (request == null) {
            res.status(404).send('No existe la solicitud');
            return;
        }
        if (request.requester != req.user.id && req.user.role != 'admin') {
            res.status(403).send('Solo quien envió la solicitud puede cancelarla');
            return;
        }
        await Request.findByIdAndDelete(req.params.id);
        res.json({ message: 'Solicitud cancelada', request: request });
    } catch (err) {
        res.status(400).send('El id de la solicitud no es válido');
    }
}
