const mongoose = require("mongoose")

const cart = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    cars: {
        type: [{
            car: mongoose.Schema.Types.ObjectId,
            quantity: Number
        }],
        ref: "car"
    }
})

module.exports = mongoose.model("cart", cart)
module.exports.Schema = cart