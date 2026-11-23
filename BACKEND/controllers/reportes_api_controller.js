const Report = require('../models/report');
const Publication = require('../models/publication');
const paginate = require('../utils/paginate');

exports.getReportes = async (req, res) => {
    let filters = {};
    if (req.query.status) {
        filters.status = req.query.status;
    }
    try {
        let docs = await Report.find(filters);
        docs.sort((a, b) => b.created_at - a.created_at);
        res.json(paginate(docs, req.query));
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.createReporte = async (req, res) => {
    if (req.body == undefined || !req.body.publication || !req.body.reason) {
        res.status(400).send('Elige la publicación y escribe el motivo del reporte');
        return;
    }
    if (typeof req.body.reason != 'string' || req.body.reason.trim().length < 5) {
        res.status(400).send('El motivo debe tener al menos 5 caracteres');
        return;
    }
    try {
        let publication = await Publication.findById(req.body.publication);
        if (publication == null) {
            res.status(404).send('No existe la publicación');
            return;
        }
        if (publication.owner == req.user.id) {
            res.status(400).send('No puedes reportar tu propia publicación');
            return;
        }
        let open = await Report.findOne({
            publication: req.body.publication,
            reporter: req.user.id,
            status: 'abierto'
        });
        if (open != null) {
            res.status(400).send('Ya reportaste esta publicación');
            return;
        }
        let report = new Report({
            publication: req.body.publication,
            publication_title: publication.title,
            reporter: req.user.id,
            reporter_name: req.user.name,
            reason: req.body.reason.trim(),
            status: 'abierto',
            created_at: new Date()
        });
        let doc = await report.save();
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).send('El id de la publicación no es válido');
    }
}

exports.updateReporte = async (req, res) => {
    if (req.body == undefined || req.body.status == undefined) {
        res.status(400).send('Manda el nuevo estado del reporte');
        return;
    }
    if (req.body.status != 'abierto' && req.body.status != 'revisado') {
        res.status(400).send('El estado solo puede ser abierto o revisado');
        return;
    }
    try {
        let doc = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (doc == null) {
            res.status(404).send('No existe el reporte');
            return;
        }
        res.json(doc);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

exports.deleteReporte = async (req, res) => {
    try {
        let doc = await Report.findByIdAndDelete(req.params.id);
        if (doc == null) {
            res.status(404).send('No existe el reporte');
            return;
        }
        res.json({ message: 'Reporte eliminado', report: doc });
    } catch (err) {
        res.status(400).send('El id del reporte no es válido');
    }
}
