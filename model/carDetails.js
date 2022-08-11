const mongoose = require("mongoose")

const {Schema: car} = require("./car")

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
    description: car,
    images: {
        type: mongoose.Schema.Types.Array,
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
module.exports.Schema = carDetails