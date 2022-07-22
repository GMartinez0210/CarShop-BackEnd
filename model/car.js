const mongoose = require("mongoose")

const {Schema: brand} = require("./brand")

const car = new mongoose.Schema({
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        default: {},
        ref: 'brand',
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

module.exports = mongoose.model("car", car)
exports.Schema = car