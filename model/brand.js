const mongoose = require("mongoose")

const brand = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("brand", brand)
exports.Schema = brand