const mongoose = require("mongoose")

const carDetails = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    licensePlate: {
        type: String,
        required: true
    },
    description: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "car",
        required: true
    },
    images: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "image",
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

module.exports = mongoose.model("carDetail", carDetails)
exports.Schema = carDetails