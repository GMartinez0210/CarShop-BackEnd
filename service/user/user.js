// * Requiring the libreries
require("dotenv").config()
const bcrypt = require("bcrypt")
const fs = require("fs")

//const round = +process.env.ROUND_HASH

// * Instancing the models
const User = require("../../model/user")
const Photo = require("../../model/photo")

// * Instancing multer to upload the profile image
const multer = require("multer")

const storage = multer.diskStorage({
    destination: "image/profile",
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`)
    }
})

const upload = multer({
    storage
}).single("photo")

// * Function to read by email one user
exports.readOne = async(req, res) => {
    const { email } = req.query

    if(!email) {
        console.log("No parameter given")
        res.json({user: null})
        return
    }

    await User.findOne({email})
        .then(user => {
            if(!user) {
                console.log("No user found")
                res.json({user: null})
                return
            }

            console.log("User was found successful")
            res.json({user})
        })
        .catch(error => {
            console.log(`Error while finding the user with email: ${email}`)
            console.log(error)
            res.json({error: true})
        })
}

// * Function to read by id one user
exports.readById = async(req, res) => {
    const {_id} = req.query

    if(!_id) {
        console.log("No parameter given")
        res.json({user: null})
        return
    }

    await User.findById(_id)
        .then(user => {
            if(user == null) {
                console.log("No user")
                res.json({user: null})
                return
            }
    
            console.log("User found sucessful")
            res.json({user})
        })
        .catch(error => {
            console.log(`Error while finding the user: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// * Function to read all the users
exports.readAll = async(req, res) => {
    await User.find()
        .then(users => {
            if(users.length == 0) {
                console.log("No users")
                res.json({users: null})
                return
            }

            console.log(`${users.length} users found`)
            res.json({users})
        })
        .catch(error => {
            console.log(`Error while finding all the users`)
            console.log(error)
            res.json({error: true})
        })
}

// * Function to create an account
exports.createOne = async(req, res) => {
    const {fullname, email, password} = req.body

    if(!fullname || !email || !password) {
        console.log("Missing a parameter")
        res.json({user: null})
        return
    }

    await User.findOne({email})
        .then(async(userFound) => {
            if(userFound != null) {
                console.log("Email taken")
                res.json({taken: true})
                return
            }

            const salt = bcrypt.genSaltSync(+process.env.ROUND_HASH)
            const hash = bcrypt.hashSync(password, salt)
    
            const user = new User({
                fullname,
                email,
                password: hash
            })

            await user.save()
                .then(userCreated => {
                    console.log("User created successful")
                    res.json({user: userCreated})
                })
                .catch(error => {
                    console.log(`Error while creating the user: ${user}`)
                    console.log(error)
                    res.json({error: true})
                })
        })
        .catch(error => {
            console.log(`Error while finding the user with email: ${email}`)
            console.log(error)
            res.json({error: true})
        })
}

// * Function to update an account
exports.updateOne = async(req, res) => {
    const {_id, fullname, email, password} = req.body

    if(!_id || !fullname || !email || !password) {
        console.log("Missing a parameter")
        res.json({user: null})
        return
    }

    const salt = bcrypt.genSaltSync(+process.env.ROUND_HASH)
    const hash = bcrypt.hashSync(password, salt)

    const user = {
        fullname,
        email,
        password: hash
    }

    const userUpdated = await User.updateOne(_id, {$set: user})
        .then(userUpdated => {
            console.log(`Account ${_id} was updated successfully`)
            return userUpdated
        })
        .catch(error => {
            console.log(`Error while updating the user ${_id}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!userUpdated) return

    await User.findById(userUpdated._id)
        .then(user => {
            if(user == null) {
                console.log("No user")
                res.json({user: null})
                return
            }

            console.log("User found sucessful")
            res.json({user})
        })
        .catch(error => {
            console.log(`Error while finding the user: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to update the user's photo
exports.updatePhoto = async (req, res) => {
    upload(req, res, async function(error) {
        if(error) {
            console.log("Error in upload function")
            console.log(error)
            res.json({error: true})
            return
        }

        const {_id} = req.body
        const photo = req.file

        if(!_id || !photo) {
            console.log("Missing a parameter")
            res.json({user: null})
            return
        }

        const user = await User.findById(_id)
            .then(user => {
                if(user == null) {
                    console.log(`Not found user: ${_id}`)
                    res.json({user})
                    return null
                }

                console.log(`User ${_id} was found successful`)
                return user
            })
            .catch(error => {
                console.log(`Error while finding the user: ${_id}`)
                console.log(error)
                res.json({error: true})
            })
        
        if(user == null) return

        if(user.photo) {
            await Photo.findByIdAndDelete(user.photo)
                .then(photo => {
                    fs.unlinkSync("./image/profile/"+photo.name)
                    console.log(`Photo ${photo._id} was found and deleted successful`)
                })
                .catch(error => {
                    console.log(`Error while finding and deleting the photo: ${user.photo}`)
                    console.log(error)
                })
        }

        const newPhoto = new Photo({
            name: photo.filename,
            photo: {
                data: photo.filename,
                contentType: photo.mimetype
            }
        })

        const photoSaved = await newPhoto.save()
            .then(photo => {
                console.log(`Photo ${photo._id} saved successful`)
                return photo
            })
            .catch(error => {
                console.log(`Error while saving the photo ${newPhoto}`)
                console.log(error)
                res.json({error: true})
            })
                
        if(!photoSaved) return

        const modifying = {
            photo: {
                _id: photoSaved._id,
                name: photoSaved.name
            }
        }

        await User.findByIdAndUpdate(_id, {$set: modifying})
            .then(user => {
                console.log(`User: ${user._id} was found and updated`)
                res.json({user})
            })
            .catch(error => {
                console.log(`Error while finding and updating user: ${_id}`)
                console.log(error)
                res.json({error: true})
            })
    })
}
// * Function to delete an account
exports.deleteOne = async(req, res) => {
    const {_id} = req.body

    await User.findByIdAndDelete(_id)
        .then(user => {
            console.log(`User with ID: ${_id} was deleted`)
            res.json({user})
        })
        .catch(error => {
            console.log(`Error while deleting the user ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}