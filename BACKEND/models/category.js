const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    active: {
        type: Boolean,
        required: true
    }
});

let Category = mongoose.model('categories', categorySchema);

module.exports = Category;
