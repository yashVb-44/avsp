// models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'customerModel',
    },
    customerModel: {
        type: String,
        enum: ['User', 'Vendor', 'TempVendor'],
    },
    ownerModel: {
        type: String,
        enum: ['User', 'Vendor'],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'ownerModel',
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

}, {
    timestamps: true,
});

module.exports = mongoose.model('Wallet', walletSchema);
