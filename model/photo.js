const mongoose = require("mongoose")

const photo = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    photo: {
        data: Buffer,
        contentType: String,
    }
})

module.exports = mongoose.model("photo", photo)
exports.Schema = photo