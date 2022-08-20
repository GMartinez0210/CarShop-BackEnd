// Requiring the modules
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const session = require("express-session")
const cookieParser = require("cookie-parser")
//const passport = require("passport")

const path = require("path")

const url = process.env.HOST
const option = {useNewUrlParser: true}

mongoose.connect(url, option, error => {
    if(error) {
        console.log(error)
        return
    }

    console.log("Connected to the database")
})

//const User = require("./model/user")

// Instancing the app server
const app = express()

// ? FROM CORS TO COOKIE-PARSER AREN'T NEEDED
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}))  
app.use(session({
    key: "userSession",
    secret: "Little Secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        //httpOnly: true,
        //sameSite: "strict",
        //secure: true,
        expires: 60 * 60 * 24 * 7
    }
}))
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

//app.use(express.static("../app/dist"))

/*
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
*/

// Processing the log in/ sign in service
const login = require("./service/login/login")
app.route("/api/login")
    .get(function(req, res) {
        login.getSession(req, res)
    })
    .post(async(req, res) => {
        await login.createSession(req, res)
    })
    .delete(async(req, res) => {
        await login.deleteSession(req, res)
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

        await user.readUsers(req, res)
    })
    .post(async(req, res) => {
        await user.createUser(req, res)
    })
    .patch(async(req, res) => {
        const {action} = req.query

        if(action == "user") {
            await user.updateUser(req, res)
            return
        }
        
        if (action == "photo") {
            await user.updatePhoto(req, res)
            return
        }
    
        res.json({error: true})
    })
    .delete(async(req, res) => {
        await user.deleteUser(req, res)
    })

// Processing the car service
const car = require("./service/car/car")
app.route("/api/car")
    .get(async(req, res) => {
        if(req.query._id) await car.readCar(req, res)
        else await car.readCars(req, res)
    })
    .post(async(req, res) => {
        await car.createCar(req, res)
    })
    .patch(async(req, res) => {
        const action = req.body.ACTION || "info"

        if(action == "imagenes") {
            await car.updateCarImages(req, res)
            return
        }
        
        if(action == "info") {
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
app.get("/api/car/brand", async function(req, res) {
    await car.getBrands(req, res)
})

// Processing the post service
const post = require("./service/post/post")
app.route("/api/post")
    .get(async(req, res) => {
        if(req.body._id) await post.readPost(req, res)
        else await post.readPosts(req, res)
    })
    .post(async(req, res) => {
        await post.createPost(req, res)
    })
    .patch(async(req, res) => {
        await post.updatePost(req, res)
    })
    .delete(async(req, res) => {
        await post.deletePost(req, res)
    })

const favorite = require("./service/favorite/favorite")
app.route("/api/favorite")
    .get(async(req, res) => {
        const {car} = req.query

        console.log(car)

        if(car) {
            await favorite.getFavorite(req, res)
            return
        }

        //await favorite.getFavorites(req, res)
        
        await favorite.getFavoriteCars(req, res)
    })
    .post(async(req, res) => {
        await favorite.addFavorite(req, res)
    })
    .delete(async(req, res) => {
        await favorite.removeFavorite(req, res)
    })

const search = require("./service/search/search")
app.get("/api/search", async function(req, res) {
    if(req.query._id) await search.searchCarByUser(req, res)
    else await search.searchCar(req, res)
})
    
// Processing the image service based on name
const Image = require("./model/image")
app.get("/api/image/:name", async function(req, res) {
    const name = req.params.name
    const imagefound = await Image.findOne({name})

    if(imagefound == null) {
        res.send("")
        return
    }

    const {name: image} = imagefound

    const imagePath = path.join(__dirname+"/image/car", image)
    
    res.sendFile(imagePath)
})

const Photo = require("./model/photo")
app.get("/api/photo/:name", async function(req, res) {
    const name = req.params.name
    const photofound = await Photo.findOne({name})
    
    if(photofound == null) {
        res.send("")
        return
    }

    const {name: photo} = photofound

    const photoPath = path.join(__dirname+"/image/profile", photo)
    
    res.sendFile(photoPath)
})

// ? At the end, if not, the rest gets 
// ? operations will never be executed
// Deploying the front-end
/*
app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, "../app/dist", "index.html"))
})
*/

// Running the server
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})