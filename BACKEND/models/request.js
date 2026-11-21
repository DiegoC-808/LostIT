const mongoose = require('mongoose');

let requestSchema = mongoose.Schema({
    publication: {
        type: String,
        required: true
    },
    publication_title: {
        type: String,
        required: true
    },
    requester: {
        type: String,
        required: true
    },
    requester_name: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pendiente', 'aceptada', 'rechazada'],
        required: true
    },
    created_at: {
        type: Date,
        required: true
    }
});

let Request = mongoose.model('requests', requestSchema);

module.exports = Request;
