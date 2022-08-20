const mongoose = require("mongoose")

const favorite = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    car: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "car"
    }
})

module.exports = mongoose.model("favorite", favorite)
module.exports.Schema = favorite