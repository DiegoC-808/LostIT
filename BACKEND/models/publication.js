const mongoose = require('mongoose');

let publicationSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['perdido', 'encontrado'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    images: [String],
    owner: {
        type: String,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['activa', 'resuelta', 'oculta'],
        required: true
    },
    created_at: {
        type: Date,
        required: true
    }
});

let Publication = mongoose.model('publications', publicationSchema);

module.exports = Publication;
