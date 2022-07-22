const mongoose = require("mongoose")

const {Schema: image} = require("./image")

const profilePhoto = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    image: {
        type: image,
        default: {},
        required: true
    }
})

module.exports = mongoose.model("profilePhoto", profilePhoto)
exports.Schema = profilePhoto