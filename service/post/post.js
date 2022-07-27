const User = require("../../model/user")
const CarDetails = require("../../model/carDetails")
const Post = require("../../model/post") 

// Function to create a post
exports.createPost = async (req, res) => {
    const {user, car} = req.body

    const post = new Post({
        user,
        car,
        time: getTime(),
        date: getDate()
    })

    await post.save()
        .then(postcreated => {
            console.log("Post created successful")
            res.json({post: postcreated})
        })
        .catch(error => {
            if(error) {
                console.log(error)
                res.json({error: true})
            }
        })
}

exports.readPost = async (req, res) => {
    const {_id} = req.body

    await Post.findById(_id)
        .then(async(post) => {
            if(post == null) {
                console.log("Post not found")
                res.json({post})    
                return
            }

            console.log("Post found")

            const user = await User.findById(post.user)
            const car = await CarDetails.findById(post.car)

            const userSchema = {
                _id: user._id,
                fullname: user.fullname,
                email: user.email
            }

            res.json({post, user: userSchema, car})
        })
        .catch(error => {
            if(error) {
                console.log(error)
                res.json({error: true})
            }
        })
}

exports.readPosts = async (req, res) => {
    await Post.find()
        .then(post => {
            console.log("Post found")

            res.json({post})
        })
        .catch(error => {
            if(error) {
                console.log(error)
                res.json({error: true})
            }
        })
}

exports.updatePost = async (req, res) => {
    const {_id, car} = req.body

    const carFound = await CarDetails.findById(car)
        .catch(error => {
            if(error) {
                console.log(error)
                res.json({error: true})
            }
        })
    
    if(carFound == null) return

    const modifying = {
        car,
        time: getTime(),
        date: getDate()
    }

    await Post.updateOne({_id}, {$set: modifying})
        .then(async () => {
            console.log(`Post updated: ${_id}`)
            
            const post = await Post.findById(_id)
                .catch(error => {
                    if (error) {
                        console.log(error)
                        res.json({error: true})
                    }
                })

            if(post == null) return

            res.json(post)
        })
        .catch(error => {
            if(error) {
                console.log(error)
                res.json({error: true})
            }
        })
}

exports.deletePost = async (req, res) => {
    const {_id} = req.body

    await Post.deleteOne({_id})
        .then(() => {
            console.log(`Post with ID: ${_id} was deleted`)
            res.json({success: true, _id})
        })
        .catch(error => {
            if(error) {
                console.log(error)
                res.json({error: true})
            }
        })
}

function getTime() {
    const date = new Date()
    const result = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    return result
}

function getDate() {
    const date = new Date()
    const result = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
    return result
}