const mongoose = require('mongoose');


const tokenSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});


const TokenModel = mongoose.model('Token', tokenSchema);

module.exports = TokenModel;