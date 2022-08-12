const mongoose = require("mongoose")

const car = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    licensePlate: {
        type: String,
        required: true
    },
    images: {
        type: mongoose.Schema.Types.Array,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    engine: {
        type: String,
        required: true
    },
    gears: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        default: 2,
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