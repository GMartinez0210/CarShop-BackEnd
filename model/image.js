const mongoose = require("mongoose")

const image = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String,
    }
})

module.exports = mongoose.model("image", image)
module.exports.Schema = image