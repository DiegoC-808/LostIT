const mongoose = require('mongoose');

let reportSchema = mongoose.Schema({
    publication: {
        type: String,
        required: true
    },
    publication_title: {
        type: String,
        required: true
    },
    reporter: {
        type: String,
        required: true
    },
    reporter_name: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['abierto', 'revisado'],
        required: true
    },
    created_at: {
        type: Date,
        required: true
    }
});

let Report = mongoose.model('reports', reportSchema);

module.exports = Report;
