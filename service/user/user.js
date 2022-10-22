// * Instancing multer to upload the profile image
const multer = require("multer")

const storage = multer.diskStorage({
    destination: "image/profile",
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`)
    }
})

const upload = multer({storage}).single("photo")

const { generateHash } = require("../../utilities/utils")

const {userCreateOne, userRead, userUpdateOne, 
    userDeleteOne} = require("../../middleware/user/user")
const { photoFindByIdAndDelete, photoCreateOne } = require("../../middleware/photo/photo")

// * Function to create an account
module.exports.createOne = async(req, res) => {
    const {fullname, email, password} = req.body
    const {error, user} = await userCreateOne({fullname, email, password})
    
    if(error) {
        res.status(400).json({error, user})
        return 
    }

    res.status(200).json({error, user})
}

// * Function to read the users
// TODO Use the custom error for this function
module.exports.readOne =  async (req, res) => {
    const query = Object.entries(req.query).filter(items => items[1])

    if(!query.length) {
        const error = new Error("No params for readOne() function in user's service")
        error.name = "No params"
        console.log(error)
        return res.status(400).json({error: error.name, user: {}})
    }

    const params = Object.fromEntries(query)

    const {error, users: [user]} = await userRead(params)

    if(error) {
        return res.status(400).json({error, user})
    }

    return res.status(200).json({error, user})
}

module.exports.readMany =  async (req, res) => {
    const params = req.query

    const {error, users} = await userRead(params)

    if(error) {
        return res.status(400).json({error, users})
    }

    return res.status(200).json({error, users})
}

module.exports.readAll =  async (req, res) => {
    const {error, users} = await userRead()

    if(error) {
        return res.status(400).json({error, users})
    }

    return res.status(200).json({error, users})
}

// * Function to update an account
module.exports.updateOne = async(req, res) => {
    const {_id, fullname, email, password} = req.body

    const hash = password && generateHash(password)

    const options = {_id, fullname, email, password: hash}

    const {error, update} = await userUpdateOne(options)

    if(error) {
        res.status(400).json({error, update})
        return
    }

    res.status(200).json({error, update})
}

// * Function to update the user's photo
module.exports.updatePhoto = async(req, res) => {
    upload(req, res, async function(error) {
        if(error) {
            res.status(400).json({error, update: false})
            return
        }

        const {_id} = req.body
        const photo = req.file

        if(!_id || !photo) {
            res.status(400).json({error, update: false})
            return
        }

        const {error: userError, users: [user]} = await userRead({_id})

        if(userError) {
            return res.status(400).json({error, update: false})
        }

        if(user.photo) {
            const photoId = user.photo._id
            const {error: photoError} = await photoFindByIdAndDelete(photoId)
            
            if(photoError) {
                res.status(400).json({error: photoError, update: false})
                return
            }
        }

        const photoSchema = {
            name: photo.filename,
            photo: {
                data: photo.filename,
                contentType: photo.mimetype
            }
        }

        const {error: photoError, photo: photoCreated} = await photoCreateOne(photoSchema)

        if(photoError) {
            res.status(400).json({error: photoError, update: false})
            return
        }

        const options = {
            _id,
            photo: {
                _id: photoCreated._id,
                name: photoCreated.name
            }
        }

        const {error: errorUpdated, update} = await userUpdateOne(options)

        if(errorUpdated) {
            res.status(400).json({error: errorUpdated, update})
            return
        }
    
        res.status(200).json({error: errorUpdated, update})
    })
}

// * Function to delete an account
module.exports.deleteOne = async(req, res) => {
    const {_id} = req.body

    const {error, user} = await userDeleteOne(_id)

    if(error) {
        res.status(400).json({error, user})
        return
    }

    res.status(200).json({error, user})
}