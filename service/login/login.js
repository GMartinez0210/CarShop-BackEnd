const bcrypt = require("bcrypt")
const User = require("../../model/user")

exports.getSession = (req, res) => {
    const userID = req.session.userID
        if(!userID) {
            res.json({loggedIn: false, userID})
            return
        }

    res.json({loggedIn: true, userID})
}

exports.createSession = async (req, res) => {
    const {email, password} = req.body

    await User.findOne({email})
        .then(user => {
            if(user == null) {
                console.log("Not found the user")
                res.json({user: null})
            }

            if(!bcrypt.compareSync(password, user.password)) {
                console.log("Password incorrect")
                res.json({email: true, password: false})
            }

            req.session.userID = user._id
            console.log(req.session)

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

exports.deleteSession = async (req, res) => {
    req.session.user = null
    console.log("Session regenerated again")
    console.log("Singing out successful")
    res.json({userID: null})
}