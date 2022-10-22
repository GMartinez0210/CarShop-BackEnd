const mongoose = require("mongoose")

const description = new mongoose.Schema({
    brand: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "brand"
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
})

module.exports = mongoose.model("description", description)
module.exports.Schema = description