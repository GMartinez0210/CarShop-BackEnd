// Requiring the modules
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
//const {v4: uuidv4} = require("uuid")
const bcrypt = require("bcrypt")

const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const round = +process.env.ROUND_HASH

const url = process.env.HOST
const option = {useNewUrlParser: true}

mongoose.connect(url, option, error => {
    if(error) {
        console.log(error)
        return
    }

    console.log("Connected to the database")
})
mongoose.set("autoIndex", true)

const User = require("./model/user")

// Instancing the app server
const app = express()

app.use(cors())  
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: "Little secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true
    }
}))
app.use(passport.initialize())
app.use(passport.session())

const port = process.env.PORT || 4000

passport.use(User.createStrategy())
passport.serializeUser(function(user, done) {
    done(null, user._id)
})
passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(error, user) {
        done(error, user)
    })
})

// Processing the login
app.post("/api/login", function(req, res) {
    const email = req.body.email
    const password = req.body.password

    User.find({email: email}, function(error, foundUser) {
        if(error) {
            console.log(error)
            return
        }

        if (foundUser.length == 0) {
            res.send("Not found the user")
            return
        }

        const [user] = foundUser

        const isEquals = bcrypt.compareSync(password, user.password)

        if(!isEquals) {
            console.log("Password incorrect")
            res.send(isEquals)
            return
        }

        console.log("Logged in successfull")
        res.send(user)
    })
})


// Processing the register 
app.post("/api/register", function(req, res) {
    const fullname = req.body.fullname
    const email = req.body.email
    const password = req.body.password

    User.find({email: email}, function(error, foundUser) {
        if(error) {
            console.log(error)
            return
        }

        if (foundUser.length != 0) {
            console.log("Email taken")
            res.send(false)
            return
        }

        const salt = bcrypt.genSaltSync(round)
        const hash = bcrypt.hashSync(password, salt)

        const user = new User({
            fullname: fullname,
            email: email,
            password: hash
        })

        user.save(err => {
            if(err) {
                console.log(err)
                res.send(false)
                return
            }

            console.log("User created")
            res.send(user)
        })
        
        /*
        user.save()
            .then(() => res.send(user))
            .catch(() => res.send(false))
        */
    })
})


// Running the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})