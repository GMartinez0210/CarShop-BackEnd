const mongoose = require("mongoose")

const {Schema: car} = require("./car")

const date = new Date()

const post = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    car: {
        type: car,
        default: {},
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