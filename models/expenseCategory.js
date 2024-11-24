const mongoose = require('mongoose');

const expenseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    createdBy: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('ExpenseCategory', expenseCategorySchema);
