const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    SubMechanic: {
        type: Schema.Types.ObjectId,
        ref: 'SubMechanic',
    },
    myVehicle: {
        type: Schema.Types.ObjectId,
        ref: 'MyVehicle',
    },
    services: [{
        type: Schema.Types.ObjectId,
        ref: 'ShopService',
    }],
    serviceWithPrice: [{
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: 'ShopService',
        },
        serviceName: String,
        labourCharges: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            default: 0
        }
    }],
    productWithPrice: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        productName: String,
        quantity: {
            type: Number,
            default: 1
        },
        labourCharges: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            default: 0
        }
    }],
    scheduleDate: {
        type: String,
    },
    vehicleCollectDate: {
        type: String,
    },
    estimateDeliveryDate: {
        type: String,
    },
    scheduleTime: {
        type: String,
    },
    pickupAddress: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
    },
    dropAddress: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
    },
    garage: {
        type: Schema.Types.ObjectId,
        ref: 'Garage',
    },
    pickupTimeSlot: {
        type: String,
    },
    dropTimeSlot: {
        type: String,
    },
    bookingID: {
        type: String,
    },
    serviceType: {
        type: String,
        default: '1'
    },
    status: {
        type: String,
        default: "0"
    },
    reason: {
        type: String,
        default: ""
    },
    odometer: String,
    advancePayAmount: {
        type: Number,
        default: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    fuelIndicator: {
        type: Number,
        default: 0
    },
    reciveOption: {
        type: String,
        default: "0"
    },
    reciverBy: String,
    collectedOption: {
        type: String,
        default: "0"
    },
    collectedBy: {
        type: Schema.Types.ObjectId,
        refPath: 'collectedByModel',
    },
    collectedByModel: {
        type: String,
        enum: ['Vendor', 'SubMechanic'],
        default: "Vendor"
    },
    deliveredOption: {
        type: String,
        default: "0"
    },
    deliveredName: String,
    deliveredMobileNo: String,
    deliveryTime: String,
    remarks: String,
    vehicleCondition: String,
    dentImage: String,
    beforeServiceImage: String,
    afterServiceImage: String,
    labourCharges: {
        type: Number,
        default: 0
    },
    pickUpCharge: {
        type: Number,
        default: 0
    },
    dropOffCharge: {
        type: Number,
        default: 0
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    payableAmount: {
        type: Number,
        default: 0
    },
    termAndCondition: String,
    serviceRemind: {
        days: String,
        date: String,
        kilometer: Number
    },
    quatationNo: {
        type: String,
        default: "05-2024-1957/1"
    },
    bookingType: {
        type: String,
        default: "0" // 0 = normal , 1 = job card, 2 = emergency
    },
    addNewServiceDate: String,
    acceptedDate: String,
    collectedByGarageDate: String,
    pendingDate: String,
    workProgressDate: String,
    cancelledByVendorDate: String,
    cancelledByUserDate: String,
    completedDate: String,
    completedTime: String,
    recivedByUserDate: String,
    declinedDate: String,
    otherService: String,
    paymentMode: {
        type: String,
        default: "0"
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
