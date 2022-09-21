const bcrypt = require("bcrypt")

const User = require("../../model/user")

// * Basic login
// Function to get the session
exports.getSession = (req, res) => {
    const userID = req.query.user
    const sessionUserID = req.session.userID

    if(!userID || !sessionUserID) {
        res.json({loggedIn: false})
        return
    }

    if(userID != sessionUserID) {
        res.json({loggedIn: false})
        return
    }

    res.json({loggedIn: true, userID: sessionUserID})
}

// Function to create a session
exports.createSession = async (req, res) => {
    const {email, password} = req.body

    await User.findOne({email})
        .then(user => {
            if(user == null) {
                console.log("Not found the user")
                res.json({user: null})
                return
            }

            if(!bcrypt.compareSync(password, user.password)) {
                console.log("Password incorrect")
                res.json({email: true, password: false})
                return
            }

            req.session.userID = user._id
            console.log("Session started")
            console.log("Signing in successful")
            res.json({
                loggedIn: true, 
                userID: user._id
            })
        })
        .catch(error => {
            console.log(error)
            res.json({error: true})
        })
}

// Function to delete a session
exports.deleteSession = async (req, res) => {
    req.session.user = null
    console.log("Session regenerated again")
    console.log("Singing out successful")
    res.json({userID: null})
}