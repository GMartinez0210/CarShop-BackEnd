const mongoose = require("mongoose")

const car = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    licensePlate: {
        type: String,
        required: true
    },
    images: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true
    },
    description: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    about: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("car", car)
module.exports.Schema = car