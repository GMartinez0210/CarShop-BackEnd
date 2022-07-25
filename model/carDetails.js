const mongoose = require("mongoose")

const carDetails = new mongoose.Schema({
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