const multer = require("multer")

const User = require("../../model/user")
const Image = require("../../model/image")
const Brand = require("../../model/brand")
const Description = require("../../model/description")
const Car = require("../../model/car")

const { createOne, findOrCreate, ObjectNotEmptyValues } = require("../../utilities/utils")
const { userRead } = require("../../middleware/user/user")
const { imageDeleteMany, imagesCreateManySchemas, imageCreateMany, 
    imageDeleteManyFromFolder } = require("../../middleware/image/image")
const { carRead, carUpdateOne, carDeleteOne, carDeleteMany } = require("../../middleware/car/car")
const { ErrorCar } = require("../../utilities/error")

const storage = multer.diskStorage({
    destination: "image/car",
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`)
    }
})

const uploadFile = multer({storage}).array("images", 5)

// * Function to create a car
module.exports.createOne = async(req, res) => {
    await uploadFile(req, res, async function(error) {
        if(error) {
            res.status(500).json({error, car: []})
            return
        }

        const { licensePlate, brand, model, price, about,
            engine, gears, seats, userId } = req.body

        const images = req.files

        const {error: userError, users: [userItem]} = await userRead({_id: userId})

        if(userError) {
            res.status(500).json({error: userError, user: userItem})
            return
        }

        const imageSchemas = imagesCreateManySchemas(images)

        const {error: imagesError, images: imagesCreated} = await imageCreateMany(imageSchemas)

        if(imagesError) {
            res.status(500).json({error: imagesError, update: false})
            return
        }
    
        // TODO Refactor from this to the end. 
        // TODO Repeating the same process three times

        const brandSchema = {name: brand}

        const {error: brandError, item: brandItem} = await findOrCreate(Brand, brandSchema)

        if(brandError) {
            res.status(500).json({error: brandError, car: []})
            return
        }

        const descriptionSchema = {
            brand: brandItem,
            model, engine,
            gears, seats
        }

        const {error: descriptionError, item: descriptionItem} = await findOrCreate(Description, descriptionSchema)

        if(descriptionError) {
            res.status(500).json({error: descriptionError, car: []})
            return
        }

        const carSchema = {
            user: userItem._id,
            licensePlate,
            images: imagesCreated,
            description: descriptionItem._id,            
            price, about
        }

        const {error: carError, item: carItem} = await createOne(Car, carSchema)
        
        if(carError) {
            res.status(500).json({error: carError, car: []})
            return
        }

        res.status(200).json({error: carError, car: carItem})
    })
}

// * Function to get a car
module.exports.readOne = async(req, res) => {
    const {_id} = req.query

    if(!_id) {
        const error = ErrorCar("No _id given")
        res.status(400).json({error, car: {}})
        return 
    }

    const {error, cars: [car]} = await carRead({_id}) 

    const status = !error ? 200 : 500

    res.status(status).json({error, car})
}

// * Function to get many cars by many ids
module.exports.readMany = async(req, res) => {
    const isFulled = Object.entries(req.query)

    if(!isFulled) {
        const error = ErrorCar("No parameters given")
        res.status(400).json({error, cars: []})
        return
    }

    const options = ObjectNotEmptyValues(req.query)

    const {error, cars} = await carRead(options) 

    const status = !error ? 200 : 500

    res.status(status).json({error, cars})
}

// * Function to get all the cars
module.exports.readAll = async(req, res) => {
    const {error, cars} = await carRead({}) 

    const status = !error ? 200 : 500

    res.status(status).json({error, cars})
}

// * Function to update the car info
module.exports.updateInfo = async(req, res) => {
    const {_id} = req.body
    const params = req.body

    if(!_id) {
        const error = ErrorCar("No _id given")
        res.json({error, update: false})
        return
    }

    const {error, update} = await carUpdateOne(params)

    const status = !error ? 200 : 500

    res.status(status).json({error, update})
}

// * Function to update the car description
module.exports.updateDescription = async(req, res) => {
    const {_id} = req.body
    const params = req.body

    if(!_id) {
        const error = ErrorCar("No _id given")
        res.status(400).json({error, update: false})
        return
    }

    const {error: carError, cars: [carItem]} = await carRead({_id}) 

    if(carError) {
        res.status(500).json({error: carError, update: false})
        return
    }

    const brandSchema = {name: params.brand ?? carItem.brand}

    const {error: brandError, item: brandItem} = await findOrCreate(Brand, brandSchema)

    if(brandError) {
        res.status(500).json({error: brandError, update: false})
        return
    }

    const descriptionSchema = {
        brand: brandItem._id,
        model: params.model ?? carItem.model,
        engine: params.engine ?? carItem.engine,
        gears: params.gears ?? carItem.gears,
        seats: params.seats ?? carItem.seats
    } 

    const {error: descriptionError, item: descriptionItem} = await findOrCreate(Description, descriptionSchema)


    if(descriptionError) {
        res.status(500).json({error: descriptionError, update: false})
        return
    }    

    const options = {_id, description: descriptionItem._id}

    const {error, update} = await carUpdateOne(options)

    const status = !error ? 200 : 500

    res.status(status).json({error, update})
}

// * Function to update the car images
module.exports.updateImages = async(req, res) => {
    uploadFile(req, res, async function(error) {
        if(error) {
            res.status(500).json({error, update: false})
            return
        }

        const {_id} = req.body
        const images = req.files

        if(!_id || !images) {
            const error = ErrorCar("No parameters given")
            res.json({error, update: false})
            return
        }

        const {error: carError, cars: [carItem]} = await carRead({_id})

        if(carError) {
            res.status(500).json({error: carError, update: false})
            return
        }

        const {images: carImages} = carItem

        const {error: imageFolderError} = imageDeleteManyFromFolder(carImages)

        if(imageFolderError) {
            res.status(500).json({error: imageFolderError, update: false})
            return
        }

        const imageDeleteOptions = {name: carImages}
        const {error: imageDeleteError} = await imageDeleteMany(imageDeleteOptions)

        if(imageDeleteError) {
            res.status(500).json({error: imageDeleteError, update: false})
            return
        }

        const imageSchemas = imagesCreateManySchemas(images)

        const {error: imagesError, images: imagesCreated} = await imageCreateMany(imageSchemas)

        if(imagesError) {
            res.status(500).json({error: imagesError, update: false})
            return
        }

        const options = {_id, images: imagesCreated}

        const {error: carUpdateError, update} = await carUpdateOne(options)

        const status = !carUpdateError ? 200 : 500
    
        res.status(status).json({error: carUpdateError, update})
    })
}

// * Function to delete a car
module.exports.deleteOne = async(req, res) => {
    const {_id} = req.body

    if(!_id) {
        const error = ErrorCar("No _id given")
        res.status(400).json({error, deleted: false})
        return
    }

    const options = {_id}

    const {error: carError, cars: [carItem]} = await carRead(options)

    if(carError) {
        res.status(500).json({error: carError, deleted: false})
        return
    }

    const {error, deleted} = await carDeleteOne(options)

    const status = !error ? 200 : 500
    
    res.status(status).json({error, deleted})

    const {images: carImages} = carItem

    imageDeleteManyFromFolder(carImages)

    const imageDeleteOptions = {name: carImages}
    await imageDeleteMany(imageDeleteOptions)
}

// * Function to delete many cars based on user's id
module.exports.deleteMany = async(req, res) => {
    const isFulled = Object.entries(req.body) 

    if(!isFulled) {
        const error = ErrorCar("No parameters given")
        res.status(400).json({error, deleted: false})
        return
    }

    const options = ObjectNotEmptyValues(req.body)

    const {error: carError, cars: carItems} = await carRead(options)

    if(carError) {
        res.status(500).json({error: carError, deleted: false})
        return
    }

    const {error, deleted} = await carDeleteMany(options)

    const status = !error ? 200 : 500 
    
    res.status(status).json({error, deleted})

    const carImages = carItems.map(car => car.images)
        .reduce((current, next) => current.concat(next))

    imageDeleteManyFromFolder(carImages)

    const imageDeleteOptions = {name: carImages}
    await imageDeleteMany(imageDeleteOptions)
}

// ! 765 Lines before refactoring
// ? 338 Lines after refactoring