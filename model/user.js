const mongoose = require("mongoose")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const user = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    photo: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

user.plugin(passportLocalMongoose)

module.exports = mongoose.model("user", user)
exports.Schema = user