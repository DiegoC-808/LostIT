const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['usuario', 'admin'],
        required: true
    },
    avatar: String,
    created_at: {
        type: Date,
        required: true
    }
});

let User = mongoose.model('users', userSchema);

module.exports = User;
