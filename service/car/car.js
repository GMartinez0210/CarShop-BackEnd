const fs = require("fs")
const multer = require("multer")

const User = require("../../model/user")
const Image = require("../../model/image")
const CarDetails = require("../../model/carDetails")

const storage = multer.diskStorage({
    destination: "image/car",
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`)
    }
})

const upload = multer({
    storage
}).array("images", 5)

// Function to create a car
exports.createCar = async(req, res) => {
    upload(req, res, async function(error){
        if(error) {
            console.log("Error in upload function")
            console.log(error)
            res.json({error: true})
            return
        }

        const { licensePlate, brand, model,
            price, about, engine,
            gears, seats, user } = req.body

        const images = req.files

        if(!images) {
            console.log("No images")
            res.json({error: true})
            return
        }

        const userFound = await User.findById(user)
            .then(userFound => {
                if(userFound == null) {
                    console.log(`Not user ${user} found`)
                    res.json({carDetails: null})
                    return
                }

                console.log(`User ${user} was found successfull`)
                return userFound
            })
            .catch(error => {
                console.log(error)
                res.json({error: true})
            })
        
        if(userFound == null) return
        
        const arrayImages = images.map(imageUploaded => {
            const image = new Image({
                name: imageUploaded.filename,
                image: {
                    data: imageUploaded.filename,
                    contentType: imageUploaded.mimetype
                }
            })

            image.save(error => {
                if(error) {
                    console.log(error)
                }

                console.log("Image saved successful")
            })

            return {_id: image._id, name: imageUploaded.filename}
        })
        
        if(arrayImages.some(item => item._id == null)) {
            res.json({error: true})
            return
        }
        
        const carSchema = {
            brand,
            model,
            engine,
            gears,
            seats
        }
        
        const carDetails = new CarDetails({
            user,
            licensePlate,
            description: carSchema,
            images: arrayImages,
            price, 
            about
        })

        await carDetails.save()
            .then(carDetails => {
                console.log("Car was saved successful")
                res.json({carDetails})
            })
            .catch(error => {
                console.log(`Error while saving the carDetails: ${carDetails}`)
                console.log(error)
                res.json({error: true})
            })
    })
}

// Function to get a car
exports.readCar = async(req, res) => {
    const {_id} = req.body

    await CarDetails.findOne({_id})
        .then(carDetails => {
            console.log(`Car Details Item with ID: ${_id} was found`)
            res.json({carDetails})
        })
        .catch(error => {
            console.log(`Error while finding the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to get all the cars
exports.readCars = async(req, res) => {
    await CarDetails.find()
        .then(carDetails => {
            console.log(`Car Details were found`)
            res.json({carDetails})
        })
        .catch(error => {
            console.log("Error while finding all the cars details")
            console.log(error)
            res.json({error: true})
        })
}

// Function to update the car info
exports.updateCarInfo = async(req, res) => {
    const { licensePlate, brand, model,
        price, about, engine,
        gears, seats, user, _id } = req.body

    const carSchema = {
        brand,
        model,
        engine,
        gears,
        seats
    }

    const car = Object.fromEntries(Object.entries(carSchema)
        .filter(value => value[1]))

    const carDetails = {
        user,
        licensePlate,
        description: car != {} && null,
        price, 
        about
    }

    const modifying = Object.fromEntries(Object.entries(carDetails)
        .filter(value => value[1]))

    await CarDetails.updateOne({_id}, {$set: modifying})
        .then(() => {
            console.log(`Updated successfull: ${_id}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while updating the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to update the car images
exports.updateCarImages = async(req, res) => {
    upload(req, res, async function(error) {
        if(error) {
            console.log("Error in upload function")
            console.log(error)
            res.json({error: true})
            return
        }

        const {_id} = req.body
        const images = req.files

        if(!images) {
            console.log("No images")
            res.json({error: true})
            return
        }

        const carFound = await CarDetails.findById(_id)
            .then((car) => {
                if(car == null) {
                    console.log("Not car found")
                    res.json({carDetails: null})
                    return null
                }
                
                console.log(`Car details ${car._id} was found success`)
                return car
            })
            .catch(error => {
                console.log(error)
                res.json({error: true})
            })

        if(carFound == null) return

        const {images: arrayCarImages} = carFound
        
        arrayCarImages.forEach(async images => {
            await Image.findByIdAndDelete(images._id)
                .then(image => {
                    fs.unlinkSync("./image/car/"+image.name)
                    console.log(`Image ${images._id} was found and deleted successful`)
                })
                .catch(error => {
                    console.log(`Error while finding and deleting the image ${_id}`)
                    console.log(error)
                })
        }) 

        const arrayImages = images.map(imageUploaded => {
            const image = new Image({
                name: imageUploaded.filename,
                image: {
                    data: imageUploaded.filename,
                    contentType: imageUploaded.mimetype
                }
            })

            image.save(error => {
                if(error) {
                    console.log(`Error while saving the image: ${image}`)
                    console.log(error)
                }

                console.log("Image saved successful")
            })

            return {_id: image._id, name: image.name}
        })

        const modifying = {images: arrayImages}

        await CarDetails.updateOne({_id}, {$set: modifying})
            .then(() => {
                console.log(`Updated successfull: ${_id}`)
                res.json({error: false})
            })
            .catch(error => {
                console.log(`Error while updating the car details: ${_id}`)
                console.log(error)
                res.json({error: true})
            })

    })
}

// Function to remove a car
exports.deleteCar = async(req, res) => {
    const _id = req.body._id

    await CarDetails.findByIdAndDelete({_id})
        .then(carDetail => {
            const images = carDetail.images

            const imageArray = images.map(async image => {
                const imageResult = await Image.findByIdAndDelete(image._id)
                    .then(() => {
                        console.log(`Image ${image._id} was deleted successfull`)
                        return image._id
                    })
                    .catch((error) => {
                        console.log(error)
                        return null
                    })

                return imageResult
            })

            if(imageArray.some(item => item == null)) {
                res.json({error: true})
                return
            }

            console.log(`Car Details Item with ID: ${_id} was deleted`)
            res.json({error: false, ...carDetail})
        })
        .catch(error => {
            console.log(`Error while deleting the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

exports.deleteCars = async(req, res) => {
    const {_id} = req.body

    await CarDetails.deleteMany({user: _id})
        .then(response => {
            const {deletedCount: number} = response
            console.log(`All the cars (${number} from the user: ${_id} were deleted successful)`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(error)
            res.json({error: true})
        })
}