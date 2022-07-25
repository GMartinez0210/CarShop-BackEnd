require("dotenv").config()
//const mongoose = require("mongoose")
//const {v4: uuidv4} = require("uuid")
const bcrypt = require("bcrypt")

const round = +process.env.ROUND_HASH

const User = require("../../model/user")

// Function to read all the users
exports.readUsers = function(req, res) {
    User.find(function(error, users) {
        if (error) {
            console.log(error)
            res.json({error: true})
            return
        }

        if(users.length == 0) {
            console.log("No users")
            res.json({users: []})
            return
        }

        console.log(`${users.length} users found`)
        res.json({users})
    })
}

// Function to read by id one user
exports.readUserById = function(req, res) {
    const {_id} = req.query
    User.findById(_id, function(error, user) {
        if (error) {
            console.log(error)
            res.json({error: true})
            return
        }

        if(user == null) {
            console.log("No user")
            res.json({user})
            return
        }

        console.log("User found sucessful")
        res.json({user})
    })
}

// Function to read by email one user
exports.readUser = function(req, res) {
    const {email} = req.query
    User.find({email}, function(error, user) {
        if (error) {
            console.log(error)
            res.json({error: true})
            return
        }

        if(user.length == 0) {
            console.log("No user")
            res.json({user: null})
            return
        }

        console.log("User found sucessful")
        res.json({user})
    })
}

// Function to create an account
exports.createUser = function(req, res) {
    const fullname = req.body.fullname
    const email = req.body.email
    const password = req.body.password

    User.find({email}, function(error, foundUser) {
        if(error) {
            console.log(error)
            return
        }

        if (foundUser.length != 0) {
            console.log("Email taken")
            res.json({taken: true})
            return
        }

        const salt = bcrypt.genSaltSync(round)
        const hash = bcrypt.hashSync(password, salt)

        const user = new User({
            fullname,
            email,
            password: hash
        })

        user.save(err => {
            if(err) {
                console.log(err)
                res.json({error: true})
                return
            }

            console.log("User created")
            res.json(user)
        })
    })
}

// Function to update an account
exports.updateUser = function(req, res) {
    const _id = req.body._id
    const fullname = req.body.fullname
    const email = req.body.email
    const password = req.body.password

    const salt = bcrypt.genSaltSync(round)
    const hash = bcrypt.hashSync(password, salt)

    const user = {
        fullname: fullname,
        email: email,
        password: hash
    }

    User.updateOne({_id: _id}, {$set: user}, function(error) {
        if (error) {
            console.log(error)
            res.json({error: true})
            return
        }

        console.log(`Account ${_id} was updated successfully`)
        res.json({_id: _id, ...user})
    })
}

// Function to delete an account
exports.deleteUser = function(req, res) {
    const _id = req.body._id

    User.deleteOne({_id: _id}, function(error) {
        if (error) {
            console.log(error)
            res.json({error: true})
            return
        }

        console.log(`Account with ID: ${_id} was deleted`)
        res.json({success: true, _id: _id})
    })
}