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
    secret: "Little Secret",
    resave: false,
    saveUninitialized: false,
    cookie: {secure: true}
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())
passport.serializeUser(function(user, done) {
    done(null, user._id)
})
passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(error, user) {
        done(error, user)
    })
})

const login = require("./service/login/login")

// Processing the log in/ sign in
app.post("/api/logIn", async function(req, res) {
    await login.singIn(req, res)
})

// Processing the log out/ sign out
app.post("/api/logOut", async function(req, res) {
    await login.singOut(req, res)
})

// Processing the user service
const user = require("./service/user/user")
app.route("/api/user")
    .get(function(req, res) {
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
        user.createUser(req, res)
    })
    .patch(function(req, res) {
        user.updateUser(req, res)
    })
    .delete(function(req, res) {
        user.createUser(req, res)
    })

// Processing the car service
const car = require("./service/car/car")
app.route("/api/car")
    .get(async function(req, res) {
        if(req.body._id) await car.getCar(req, res)
        else await car.getCars(req, res)
    })
    .post(async function(req, res) {
        await car.addCar(req, res)
    })
    .patch(async function(req, res) {
        const {info, description, images} = req.query

        if(info) {
            await car.modifyCarInfo(req, res)
            return
        }
        
        if(description){
            await car.modifyCarDescription(req, res)  
            return
        } 
    
        if(images) {
            await car.modifyCarImage(req, res)
            return
        }

        res.json({error: true})
    })
    .delete(async function(req, res) {
        await car.removeCar(req, res)
    })

// Processing the post service
const post = require("./service/post/post")
app.route("/api/post")
    .get(async (req, res) => {
        if(req.body._id) await post.readPost(req, res)
        else await post.readPosts(req, res)
    })
    .post(async (req, res) => {
        await post.createPost(req, res)
    })
    .patch(async (req, res) => {
        await post.updatePost(req, res)
    })
    .delete(async (req, res) => {
        await post.deletePost(req, res)
    })

// Processing the image service based on id
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
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})