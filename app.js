// Requiring the modules
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const session = require("express-session")
const cookieParser = require("cookie-parser")

const passport = require("passport")
const LocalStrategy =  require("passport-local")
const GoogleStrategy = require("passport-google-oauth20")
const FacebookStrategy = require("passport-facebook")

const path = require("path")
const bcrypt = require("bcrypt")

const url = process.env.HOST
const option = {useNewUrlParser: true}

mongoose.connect(url, option, error => {
    if(error) {
        console.log(error)
        return
    }

    console.log("Connected to the database")
})

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
        sameSite: "strict",
        //secure: true,
        expires: 60 * 60 * 24 * 7
    }
}))
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

app.use(express.static("../app/dist"))

app.use(passport.initialize())
app.use(passport.session())

const User = require("./model/user")

passport.use(User.createStrategy())

passport.serializeUser(function(user, done) {
    done(null, user._id)
})
passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(error, user) {
        done(error, user)
    })
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {        
        User.findOrCreate({googleId: profile.id}, function(error, user) {
            return cb(error, user)
        })
    })
)

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile)
        
        User.findOrCreate({ facebookId: profile.id }, function (err, user) {
            return cb(err, user)
        })
    }
))

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({email: username}, function (error, user) {
        if (error) { 
            return done(error) 
        }

        if (!user) { 
            return done(null, false)
        }
        
        if (!bcrypt.compareSync(password, user.password)) { 
            return done(null, false)
        }
        
        return done(null, user)
    })
}))

// Processing the log in/ sing in using Google
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
)

app.get("/auth/google/rentit", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
        res.redirect("/")
    }
)

app.get('/auth/facebook', 
    passport.authenticate('facebook')
)

app.get('/auth/facebook/rentit',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    }
)

// Processing the log in/ sign in service
const login = require("./service/login/login")

app.route("/api/login")
    .get(function(req, res) {
        login.getSession(req, res)
    })
    .post(function(req, res) {
        const {username, password} = req.body
        const user = new User({email: username, password})

        req.login(user, function(error) {
            if(error) {
                console.log("Error while logging")
                console.log(error)
                return
            }

            passport.authenticate("local")(req, res, function() {                
                const {req: {user: userLogged}} = res

                const userNoPassword = {
                    ...userLogged._doc,
                    password: undefined
                }

                res.json({user: userNoPassword})
            })
        })
    })
    .delete(async(req, res) => {
        await login.deleteSession(req, res)
    })

// Processing the user service
const user = require("./service/user/user")
app.route("/api/user")
    .get(async(req, res) => {
        await user.readOne(req, res)
    })
    .post(async(req, res) => {
        await user.createOne(req, res)
    })
    .patch(async(req, res) => {
        const action = req.query.action || "user"

        if(action === "user") {
            await user.updateOne(req, res)
            return
        }
        
        if (action === "photo") {
            await user.updatePhoto(req, res)
            return
        }
    
        res.json({error: new Error("Parameter given as the action is wrong")})
    })
    .delete(async(req, res) => {
        await user.deleteOne(req, res)
    })

app.route("/api/users")
    .get(async(req, res) => {
        if(req.query) {
            await user.readMany(req, res)
            return
        }

        await user.readAll(req, res)
    })

// Processing the car service
const car = require("./service/car/car")
app.route("/api/car")
    .get(async(req, res) => {
        await car.readOne(req, res)
    })
    .post(async(req, res) => {
        await car.createOne(req, res)
    })
    .patch(async(req, res) => {
        const action = req.query.action || "info"

        if(action == "images") {
            await car.updateImages(req, res)
            return
        }

        if(action == "description") {
            await car.updateDescription(req, res)
            return
        }
        
        if(action == "info") {
            await car.updateInfo(req, res)
            return
        }

        res.json({error: true})
    })
    .delete(async function(req, res) {
        await car.deleteOne(req, res)
    })

app.route("/api/cars")
    .get(async(req, res) => {
        if(req.query) {
            await car.readMany(req, res)
            return
        }

        await car.readAll(req, res)
    })
    .delete(async(req, res) => {
        await car.deleteMany(req, res)
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

// Processing the favorite service
const favorite = require("./service/favorite/favorite")
app.route("/api/favorite")
    .get(async(req, res) => {
        const {car} = req.query

        if(car) {
            await favorite.check(req, res)
            return
        }

        await favorite.getFavoriteCars(req, res)
    })
    .post(async(req, res) => {
        await favorite.addOne(req, res)
    })
    .delete(async(req, res) => {
        await favorite.removeOne(req, res)
    })

const cart = require("./service/cart/cart")
app.route("/api/cart")
    .get(async(req, res) => {
        await cart.getCartCars(req, res)
    })
    .post(async(req, res) => {
        await cart.addOne(req, res)
    })
    .patch(async(req, res) => {
        await cart.updateOne(req, res)
    })
    .delete(async(req, res) => {
        await cart.removeOne(req, res)
    })

// Processing extra methods for getting car data
const brand = require("./service/brand/brand")
app.get("/api/brand", async function(req, res) {
    await brand.readAll(req, res)
})

// Processing the search service 
const search = require("./service/search/search")
app.get("/api/search", async function(req, res) {
    await search.byBrandAndModel(req, res)
})
app.get("/api/search/brand", async function(req, res) {
    await search.byBrand(req, res)
})
app.get("/api/search/user", async function(req, res) {
    await search.byUser(req, res)
})
    
const picture = require("./service/picture/picture")
// Processing the car image service based on name
app.get("/api/image/:name", async function(req, res) {
    await picture.getImage(req, res)
})

// Processing the user photo service based on name
app.get("/api/photo/:name", async function(req, res) {
    await picture.getPhoto(req, res)
})

// Deploying the front-end
app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, "../app/dist", "index.html"))
})

// Running the server
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})