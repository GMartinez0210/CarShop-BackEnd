const mongoose = require("mongoose")

const image = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String,
        //required: true
    }
})

module.exports = mongoose.model("image", image)
exports.Schema = image