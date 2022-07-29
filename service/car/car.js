const fs = require("fs")
const multer = require("multer")

const User = require("../../model/user")
const Image = require("../../model/image")
const Brand = require("../../model/brand")
const Car = require("../../model/car")
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

// Function to get a car
exports.getCar = async(req, res) => {
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
exports.getCars = async(req, res) => {
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

// Function to add a car
exports.addCar = async(req, res) => {    
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
        
        console.log("Before Mapeo")

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

            return image
        })
        

        if(arrayImages.some(item => item == null)) {
            res.json({error: true})
            return
        }

        const brandSchema = {
            name: brand
        }
        const {item: itemBrand, error: errorBrand} = await findOrCreate(Brand, brandSchema)
        
        if(errorBrand) {
            console.log(errorBrand)
            res.json({error: true})
            return
        }
        
        const carSchema = {
            brand: itemBrand._id,
            model,
            engine,
            gears,
            seats
        }
        
        const {item: itemCar, error: errorCar} = await findOrCreate(Car, carSchema)
        
        if(errorCar) {
            console.log(errorCar)
            res.json({error: true})
            return
        }
        
        const carDetails = new CarDetails({
            user,
            licensePlate,
            description: itemCar._id,
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

// Function to modify the car info
exports.modifyCarInfo = async(req, res) => {  
    const {_id, licensePlate, price, about} = req.body

    const modifying = {
        licensePlate,
        price,
        about
    }

    await CarDetails.updateOne({_id}, {$set: modifying})
        .then(async() => {
            await CarDetails.findById(_id)
                .then(car => {
                    console.log(`Car details ${car._id} was found successful`)
                    res.json({carDetails: car})
                })
                .catch(error => {
                    console.log(`Error while finding the car details: ${_id}`)
                    console.log(error)
                    res.json({error: true})
                })
        })
        .catch(error => {
            console.log(`Error while updating the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to modify the car description (model)
exports.modifyCarDescription = async(req, res) => {
    const {_id, brand, model, engine, gears, seats} = req.body

    const brandSchema = {
        name: brand
    }

    const {item: itemBrand, error: errorBrand} = await findOrCreate(Brand, brandSchema)
    
    if(errorBrand) {
        console.log("Error Brand: ")
        console.log(errorBrand)
        res.json({error: true})
        return
    }
    
    const carSchema = {
        model,
        engine,
        gears,
        seats
    }
    
    const auxBrand = {brand: itemBrand._id}
    
    const {item: itemCar, error: errorCar} = await findOrCreate(Car, carSchema, auxBrand)
    
    if(errorCar) {
        console.log("Error car: ")
        console.log(errorCar)
        res.json({error: true})
        return
    }

    const modifying = {description: itemCar._id}

    await CarDetails.updateOne({_id}, {$set: modifying})
        .then(async() => {
            await CarDetails.findById(_id)
                .then(carDetails => {
                    console.log(`Car details ${carDetails._id} was found`)
                    res.json({carDetails})
                })
                .catch(error => {
                    console.log(`Error while finding car details: ${_id}`)
                    console.log(error)
                    res.json({error: true})
                })
        })
        .catch(error => {
            console.log(`Error while updating car details: ${_id}`)
            console.log(error)
            res.json({error: true})
        })  
}

// Function to modify the car image
exports.modifyCarImage = async(req, res) => {
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
        
        arrayCarImages.forEach(async _id => {
            await Image.findOne({_id})
                .then(async image => {
                    fs.unlinkSync("./image/car/"+image.name)
                    await Image.deleteOne({_id})
                        .then(() => {
                            console.log(`Image ${_id} was deleted successful`)
                        })
                        .catch(error => {
                            console.log(`Error while deleting the image ${_id}`)
                            console.log(error)
                        })
                })
                .catch(error => {
                    console.log(`Error while finding the image ${_id}`)
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

            return image
        })

        const modifying = {images: arrayImages}

        await CarDetails.updateOne({_id}, {$set: modifying})
            .then(async() => {
                await CarDetails.findById(_id)
                    .then(car => {
                        res.json({carDetails: car})
                    })
                    .catch(error => {
                        console.log(`Error while finding the car details: ${_id}`)
                        console.log(error)
                        res.json({error: true})
                    })
            })
            .catch(error => {
                console.log(`Error while updating the car details: ${_id}`)
                console.log(error)
                res.json({error: true})
            })

    })
}

// Function to remove a car
exports.removeCar = async(req, res) => {
    const CarDetails = require("../../model/carDetails")

    const _id = req.body._id

    await CarDetails.deleteOne({_id})
        .then(() => {
            console.log(`Car Details Item with ID: ${_id} was deleted`)
            res.json({success: true, _id: _id})
        })
        .catch(error => {
            console.log(`Error while deleting the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function find or create 
async function findOrCreate (model, schema, aux) {
    try {
        const item = await model.findOne(schema)
            .then(async itemFound => {
                if(itemFound != null) {
                    console.log("Item found sucessful")
                    return itemFound
                }

                let newItem = {}

                if(aux == undefined 
                || aux == null) newItem = new model(schema)
                else newItem = new model({...schema, ...aux})

                const itemSaved = await newItem.save()
                    .then((item) => {
                        console.log("Item created successful")
                        return item
                    })
                    .catch(error => {
                        console.log("Error while saving item: ")
                        console.log(error)
                    })

                return itemSaved
            })
            .catch(error => {
                console.log("Error while finding item: ")
                console.log(error)
            })
        return {item}
    } 
    catch (error) {
        console.log("Inside the find or create: ")
        console.log(error)
        return {error}
    }
}