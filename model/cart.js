const mongoose = require("mongoose")

const cart = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    cars: {
        type: [mongoose.Schema.Types.Mixed],
        ref: "car"
    }
})

module.exports = mongoose.model("cart", cart)
module.exports.Schema = cart