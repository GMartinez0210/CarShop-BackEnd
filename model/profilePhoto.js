const mongoose = require("mongoose")

const profilePhoto = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        default: {},
        required: true
    }
})

module.exports = mongoose.model("profilePhoto", profilePhoto)
exports.Schema = profilePhoto