const bcrypt = require("bcrypt")
const User = require("../../model/user")

exports.singIn = async (req, res) => {
    const {email, password} = req.body

    await User.findOne({email})
        .then(user => {
            if(user == null) {
                console.log("Not found the user")
                res.json({email: false})
                return
            }

            if(!bcrypt.compareSync(password, user.password)) {
                console.log("Password incorrect")
                res.json({email: true, password: false})
                return
            }

            req.session.regenerate(error => {
                if(error) {
                    console.log(error)
                    res.json({error: true})
                    return
                }

                console.log("Session started")

                req.session.user = user._id

                req.session.save(err => {
                    if(err) {
                        console.log(err)
                        res.json({error: true})
                        return
                    }

                    console.log("Session saved")
                })
            })

            console.log("Signing in successful")
            res.json({user})
        })
        .catch(error => {
            console.log(error)
            res.json({error: true})
        })
}

exports.singOut = async (req, res) => {
    req.session.user = null
    req.session.save(error => {
        if (error) {
            console.log(error)
            res.json({error: true})
            return
        }

        console.log("Session saved")

        /*
        regenerate the session, which is good practice to help
        guard against forms of session fixation
        */
        req.session.regenerate(err => {
            if (err) {
                console.log(err)
                res.json({error: true})
                return
            }

            console.log("Session regenerated again")
            console.log("Singing out successful")
        })

        res.json({user: null})
    })
}