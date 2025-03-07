const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    mobileNo: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    },
    response: {
        type: String
    },
    type: {
        type: String,
        enum: ["0", "1"], // 0 = user , 1 = vendor
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'customerModel',
    },
    status: {
        type: String,
        default: "0" // 0 = pending, 1 = approved, 2 = rejected  , 3 = ongoing, 4 = completed 
    },
    customerModel: {
        type: String,
        enum: ['User', 'Vendor'],
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('ContactUs', contactUsSchema);
