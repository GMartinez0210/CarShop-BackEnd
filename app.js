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

const url = process.env.HOST
const option = {useNewUrlParser: true}

mongoose.connect(url, option, error => {
    if(error) {
        console.log(error)
        return
    }

    console.log("Connected to the database")
})
//mongoose.set("autoIndex", true)

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

app.post("/api/login", function(req, res) {
    const email = req.body.email
    const password = req.body.password

    User.find({email: email}, function(error, foundUser) {
        if(error) {
            console.log(error)
            res.json({error: true})
            return
        }

        if (foundUser.length == 0) {
            console.log("Not found the user")
            res.json({email: false})
            return
        }

        const [user] = foundUser

        const isEquals = bcrypt.compareSync(password, user.password)

        if(!isEquals) {
            console.log("Password incorrect")
            res.json({email: true, password: isEquals})
            return
        }

        console.log("Logged in successfull")
        res.json({user})
    })
})

app.route("/api/user")
    .get(function(req, res) {
        const user = require("./service/user/user")

        const {_id, email} = req.query

        if(_id != null) {
            user.readUserById(req, res)
            return
        }

        if(email != null) {
            user.readUser(req, res)
            return
        }

        console.log("No sent a query")
        user.readUsers(req, res)
    })
    .post(function(req, res) {
        const user = require("./service/user/user")
        user.createUser(req, res)
    })
    .patch(function(req, res) {
        const user = require("./service/user/user")
        user.updateUser(req, res)
    })
    .delete(function(req, res) {
        const user = require("./service/user/user")
        user.createUser(req, res)
    })

app.route("/api/car")
    .post(async function(req, res) {
        const car = require("./service/car/car")
        await car.addCar(req, res)
    })
    .patch(async function(req, res) {
        const car = require("./service/car/car")
        //await car.modifyCarInfo(req, res)
        //await car.modifyCarDescription(req, res)
        await car.modifyCarImage(req, res)
    })
    .delete(async function(req, res) {
        const car = require("./service/car/car")
        await car.removeCar(req, res)
    })
  
app.get("/api/image/:name", async function(req, res) {
    const path = require("path")
    const name = req.params.name
    const Image = require("./model/image")
    const imagefound = await Image.findOne({name})
    const {name: image} = imagefound

    const imagePath = path.join(__dirname+"/image/car", image)
    
    res.sendFile(imagePath)
})

// Running the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})