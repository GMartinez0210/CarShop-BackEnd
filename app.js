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
    saveUninitialized: true,
    cookie: {secure: true}
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static("./image"))

passport.use(User.createStrategy())
passport.serializeUser(function(user, done) {
    done(null, user._id)
})
passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(error, user) {
        done(error, user)
    })
})

app.get("/api/session", function(req, res) {    
    res.send([req.session, req.sessionStore])
})

const login = require("./service/login/login")

// Processing the log in/ sign in
app.post("/api/login", async function(req, res) {
    await login.singIn(req, res)
})

// Processing the log out/ sign out
app.post("/api/logout", async function(req, res) {
    await login.singOut(req, res)
})

// Processing the user service
const user = require("./service/user/user")
app.route("/api/user")
    .get(async(req, res) => {
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
        await user.readUsers(req, res)
    })
    .post(async(req, res) => {
        await user.createUser(req, res)
    })
    .patch(async(req, res) => {
        //user.updateUser(req, res)
        await user.updatePhoto(req, res)
    })
    .delete(async(req, res) => {
        await user.deleteUser(req, res)
    })

// Processing the car service
const car = require("./service/car/car")
app.route("/api/car")
    .get(async(req, res) => {
        if(req.body._id) await car.readCar(req, res)
        else await car.readCars(req, res)
    })
    .post(async(req, res) => {
        await car.createCar(req, res)
    })
    .patch(async(req, res) => {
        const action = req.body.ACTION || "info"

        if(action === "imagenes") {
            await car.updateCarImages(req, res)
            return
        }
        
        if(action === "info") {
            await car.updateCarInfo(req, res)
            return
        }

        res.json({error: true})
    })
    .delete(async function(req, res) {
        const {ACTION} = req.body || "one"
        if(ACTION === "one") {
            await car.deleteCar(req, res)
            return
        }

        if(ACTION === "many") {
            await car.deleteCars(req, res)
            return
        }

        res.json({error: true})
    })

// Processing extra methods for getting car data
app.get("/api/car/description", async function(req, res) {
    await car.getDescription(req, res)
})
app.get("/api/car/brand", async function(req, res) {
    await car.getBrand(req, res)
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

const search = require("./service/search/search")
app.get("/api/search", async function(req, res) {
    await search.searchCarByName(req, res)
})

const path = require("path")
    
// Processing the image service based on name
const Image = require("./model/image")
app.get("/api/image/:name", async function(req, res) {
    const name = req.params.name
    const imagefound = await Image.findOne({name})
    const {name: image} = imagefound

    const imagePath = path.join(__dirname+"/image/car", image)
    
    res.sendFile(imagePath)
})

const Photo = require("./model/photo")
app.get("/api/photo/:name", async function(req, res) {
    const name = req.params.name
    const photofound = await Photo.findOne({name})
    const {name: photo} = photofound

    const photoPath = path.join(__dirname+"/image/profile", photo)
    
    res.sendFile(photoPath)
})

// Running the server
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})