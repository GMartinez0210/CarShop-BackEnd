const mongoose = require("mongoose")

const date = new Date()

const post = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carDetails",
        required: true
    },
    time: {
        type: String,
        default: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    },
    date: {
        type: String,
        default: `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
    }
})

module.exports = mongoose.model("post", post)
exports.Schema = post