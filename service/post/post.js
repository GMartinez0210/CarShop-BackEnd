// Instancing the models needed
const User = require("../../model/user")
const Car = require("../../model/car")
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
        .then(postCreated => {
            console.log(`Post ${postCreated._id} created successful`)
            res.json({post: postCreated})
        })
        .catch(error => {
            console.log(`Error while saving the post: ${post}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to read a post
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
                .then(user => {
                    console.log(`User ${user._id} was found successful`)
                })
                .catch(error => {
                    console.log(`Error while finding the user: ${post.user}`)
                    console.log(error)
                })
            const car = await Car.findById(post.car)
                .then(car => {
                    console.log(`Car ${car._id} was found successful`)
                })
                .catch(error => {
                    console.log(`Error while finding the user: ${post.car}`)
                    console.log(error)
                })

            const userSchema = {
                _id: user._id,
                fullname: user.fullname,
                email: user.email
            }

            res.json({post, user: userSchema, car})
        })
        .catch(error => {
            console.log(`Error while finding the post: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to read all the posts
exports.readPosts = async (req, res) => {
    await Post.find()
        .then(post => {
            console.log(`Posts was found successful`)
            res.json({post})
        })
        .catch(error => {
            console.log("Error while finding the posts" )
            console.log(error)
            res.json({error: true})
        })
}

// Function to update a post
exports.updatePost = async (req, res) => {
    const {_id, car} = req.body

    const carFound = await Car.findById(car)
        .then(car => {
            console.log(`Car details ${car._id} was found sucessful`)
        })
        .catch(error => {
            console.log(error)
            res.json({error: true})
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
                .then(post => {
                    console.log(`Post ${post._id} was found successful`)
                })
                .catch(error => {
                    console.log(error)
                    res.json({error: true})
                })

            if(post == null) return

            res.json(post)
        })
        .catch(error => {
            console.log(error)
            res.json({error: true})
        })
}

// Function to delete a post
exports.deletePost = async (req, res) => {
    const {_id} = req.body

    await Post.deleteOne({_id})
        .then(() => {
            console.log(`Post with ID: ${_id} was deleted`)
            res.json({success: true, _id})
        })
        .catch(error => {
            console.log(`Error while deleting the post: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

exports.deletePosts = async (req, res) => {
    const {_id} = req.body

    await Post.deleteMany({user: _id})
        .then(() => {
            console.log(`Posts made by the user: ${_id} were deleted`)
            res.json({success: true, user: _id})
        })
        .catch(error => {
            console.log(`Error while deleting the posts by user: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to get the current time
function getTime() {
    const date = new Date()
    const result = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    return result
}

// Function to get the current date
function getDate() {
    const date = new Date()
    const result = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
    return result
}