// models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'Vendor',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'User',
    },
    name: {
        type: String
    },
    amount: {
        type: Number,
        default: 0
    },
    virtualAmount: {
        type: Number,
        default: 0
    },
    ownerVendor: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'Vendor',
    },
    ownerUser: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'User',
    },

}, {
    timestamps: true,
});

module.exports = mongoose.model('Wallet', walletSchema);
