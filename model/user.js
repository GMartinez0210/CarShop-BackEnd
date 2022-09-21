const mongoose = require("mongoose")

const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require("mongoose-findorcreate")

const user = new mongoose.Schema({
    googleId: {
        type: String,
    },
    fullname: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    photo: {
        type: mongoose.Schema.Types.Mixed,
    }
})

user.plugin(passportLocalMongoose)
user.plugin(findOrCreate)

module.exports = mongoose.model("user", user)
exports.Schema = user