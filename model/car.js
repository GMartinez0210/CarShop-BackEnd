const mongoose = require("mongoose")

const car = new mongoose.Schema({
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
    }
})

module.exports.Schema = car