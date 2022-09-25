const fs = require("fs")
const multer = require("multer")

const User = require("../../model/user")
const Image = require("../../model/image")
const Brand = require("../../model/brand")
const Description = require("../../model/description")
const Car = require("../../model/car")

const { findOrCreate } = require("../../utilities")

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
exports.createOne = async(req, res) => {
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

        if(!images || !licensePlate 
        || !brand || !model 
        || !price || !about
        || !engine || !gears 
        || !seats || !user) {
            console.log("Missing a parameter")
            res.json({error: true})
            return
        }

        const userFound = await User.findById(user)
            .then(userFound => {
                if(userFound == null) {
                    console.log(`Not user ${user} found`)
                    res.json({car: null})
                    return null
                }

                console.log(`User ${user} was found successfull`)
                return userFound
            })
            .catch(error => {
                console.log(error)
                res.json({error: true})
                return null
            })
        
        if(!userFound) return
        
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
        
        if(arrayImages.some(item => item._id == null)) {
            res.json({error: true})
            return
        }
        
        const brandFOC = await findOrCreate(Brand, {name: brand})

        const descriptionFOC = await findOrCreate(Description, {
            brand: brandFOC,
            model,
            engine,
            gears,
            seats,
        })

        const car = new Car({
            user,
            licensePlate,
            images: arrayImages,
            description: descriptionFOC,            
            price, 
            about
        })

        await car.save()
            .then(car => {
                console.log("Car was saved successful")
                res.json({car})
            })
            .catch(error => {
                console.log(`Error while saving the car: ${car}`)
                console.log(error)
                res.json({error: true})
            })
    })
}

// Function to get a car
exports.readOne = async(req, res) => {
    const {_id} = req.query

    if(!_id) {
        console.log("No parameter given")
        res.json({error: true})
        return
    }

    const car = await Car.findById(_id)
        .then(car => {
            if(!car) {
                console.log("No car found")
                res.json({car: null})
                return null
            }

            console.log(`Car with ID: ${_id} was found`)
            return car
        })
        .catch(error => {
            console.log(`Error while finding the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!car) return

    const description = await Description.findById(car.description)
        .then(description => {
            if(!description) {
                console.log("No description found")
                res.json({car: null})
                return null
            }

            console.log(`Description with ID: ${car.description} was found`)
            return description
        })
        .catch(error => {
            console.log(`Error while finding the description: ${car.description}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!description) return

    const brand = await Brand.findById(description.brand)
        .then(brand => {
            if(!brand) {
                console.log("No brand found")
                res.json({car: null})
                return null
            }

            console.log(`Brand with ID: ${description.brand} was found`)
            return brand.name
        })
        .catch(error => {
            console.log(`Error while finding the brand: ${description.brand}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!brand) return

    const images = await Image.find({_id: car.images})
        .then(images => {
            if(!images) {
                console.log("No images found")
                res.json({car: null})
                return null
            }

            console.log(`Images with ID: ${car.images} was found`)
            
            const imageNames = images.map(image => image.name)

            return imageNames
        })
        .catch(error => {
            console.log(`Error while finding the images: ${car.images}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!images) return
    
    const carInfo = {
        ...car._doc,
        ...description._doc,
        images,brand,
        _id: car._id
    }

    res.json({car: carInfo})
}

// Function to get many cars by many ids
exports.readMany = async(req, res) => {
    const {_id} = req.query

    if(!_id) {
        console.log("No parameter given")
        res.json({error: true})
        return
    }

    const cars = await Car.find({_id})
        .then(cars => {
            if(!cars) {
                console.log("No car found")
                res.json({car: null})
                return null
            }

            console.log(`Car with ID: ${_id} were found`)
            return cars
        })
        .catch(error => {
            console.log(`Error while finding the cars: ${_id}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!cars) return

    const descriptionIDs = cars.map(car => car.description)

    const descriptions = await Description.find({_id: descriptionIDs})
        .then(descriptions => {
            if(!descriptions) {
                console.log("No description found")
                res.json({car: null})
                return null
            }

            console.log(`Description with ID: ${descriptionIDs} were found`)
            return descriptions
        })
        .catch(error => {
            console.log(`Error while finding the description: ${descriptionIDs}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!descriptions) return

    const brandIDs = descriptions.map(description => description.brand)

    const brands = await Brand.find({_id: brandIDs})
        .then(brands => {
            if(!brands) {
                console.log("No brand found")
                res.json({car: null})
                return null
            }

            console.log(`Brand with ID: ${brandIDs} was found`)
            return brands
        })
        .catch(error => {
            console.log(`Error while finding the brand: ${brandIDs}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!brands) return

    const imagesIDs = []
    
    cars.forEach(car => {
        car.images.forEach(image => imagesIDs.push(image))
    })

    const imagesArray = await Image.find({_id: imagesIDs})
        .then(images => {
            if(!images) {
                console.log("No images found")
                res.json({car: null})
                return null
            }

            console.log(`Images with ID: ${imagesIDs} were found`)
            
            return images
        })
        .catch(error => {
            console.log(`Error while finding the images: ${imagesIDs}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!imagesArray) return

    const descriptionAndBrand = descriptions.map(description => {
        const [brand] = brands.filter(brand => 
            brand._id.toString() == description.brand.toString())

        return {
            ...description._doc,
            brand: brand.name
        }
    })

    const carAndDescription = cars.map(car => {
        const [description] = descriptionAndBrand.filter(description =>
            description._id.toString() == car.description.toString()
        )

        return {
            ...description,
            ...car._doc
        }
    })

    const carAndImages = carAndDescription.map(car => {
        const images = []
        
        imagesArray.forEach(image => {            
            car.images.forEach(carImage => {
                if(carImage.toString() == image._id.toString()) {
                    images.push(image.name)
                }
            })
        })

        return {
            ...car,
            images
        } 
    })

    res.json({cars: carAndImages})
}

// Function to get all the cars
exports.readAll = async(req, res) => {
    const brands = await Brand.find()
        .then(brands => {
            if(!brands) {
                console.log("No brands found")
                res.json({car: null})
                return null
            }

            console.log("Brands were found successfull")
            return brands
        })
        .catch(error => {
            console.log("Error while finding all the brands")
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!brands) return

    const brandIDs = brands.map(brand => brand._id)

    const descriptions = await Description.find({brand: brandIDs})
        .then(descriptions => {
            if(!descriptions) {
                console.log("No descriptions found")
                res.json({car: null})
                return null
            }

            console.log("Descriptions were found successfull")

            return descriptions
        })
        .catch(error => {
            console.log("Error while finding all the descriptions")
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!descriptions) return

    const descriptionsInfo = descriptions.map(description => {
        const [brandName] = brands.filter(brand => 
            brand._id.toString() == description.brand.toString())

        return {
            ...description._doc,
            brand: brandName.name,
        }
    })
    
    const descriptionIDs = descriptions.map(description => description._id)

    const cars = await Car.find({description: descriptionIDs})
        .then(cars => {
            if(!cars) {
                console.log("No cars found")
                res.json({car: null})
                return null
            }

            console.log("Cars were found successfull")
            return cars
        })
        .catch(error => {
            console.log("Error while finding all the cars")
            console.log(error)
            res.json({error: true})
            return null
        })

    const carInfo = cars.map(car => {
        const [descriptionInfo] = descriptionsInfo.filter(description => 
            description._id.toString() == car.description.toString())

        return {
            ...descriptionInfo,
            ...car._doc
        }
    })

    const imagesIDs = []
    
    carInfo.forEach(car => {
        car.images.forEach(image => imagesIDs.push(image))
    })

    const imagesArray = await Image.find({_id: imagesIDs})
        .then(images => {
            if(!images) {
                console.log("No images found")
                res.json({car: null})
                return null
            }

            console.log(`Images with ID: ${imagesIDs} were found`)
            
            return images
        })
        .catch(error => {
            console.log(`Error while finding the images: ${imagesIDs}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!imagesArray) return

    const carAndImages = carInfo.map(car => {
        const images = []
        
        imagesArray.forEach(image => {            
            car.images.forEach(carImage => {
                if(carImage.toString() == image._id.toString()) {
                    images.push(image.name)
                }
            })
        })

        return {
            ...car,
            images
        } 
    })

    res.json({cars: carAndImages})
}

// Function to update the car info
exports.updateInfo = async(req, res) => {
    const { licensePlate, price, 
        about, user, _id } = req.body
    
    if(!_id) {
        console.log("Missing the id")
        res.json({error: true})
        return
    }

    const modifying = Object.fromEntries(Object.entries({
        licensePlate, price, 
        about, user
    }).filter(value => value[1]))

    await Car.updateOne({_id}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${_id} was found successful`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while updating the car: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to update the car description
exports.updateDescription = async(req, res) => {
    const { brand, model, engine, 
        gears, seats, _id } = req.body

    if(!_id) {
        console.log("ID missing")
        res.json({error: true})
        return
    }
    
    const car = await Car.findById(_id)
        .then(car => {
            if(!car) {
                console.log("No car found")
                res.json({car: null})
                return null
            }

            console.log(`Car with ID: ${_id} was found`)
            return car
        })
        .catch(error => {
            console.log(`Error while finding the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!car) return

    const description = await Description.findById(car.description)
        .then(description => {
            if(!description) {
                console.log("No car found")
                res.json({car: null})
                return null
            }

            console.log(`description with ID: ${car.description} was found`)
            return description
        })
        .catch(error => {
            console.log(`Error while finding the description details: ${car.description}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    const newBrand = !!brand 
        ? await findOrCreate(Brand, {name: brand})
        : null

    const gotDescription = Object.fromEntries(Object.entries({
        model, engine, gears, seats
    }).filter(value => value[1]))

    const descriptionSchema = {
        brand: !!newBrand ? newBrand._id : description.brand,
        model: description.model,
        engine: description.engine,
        gears: description.gears,
        seats: description.seats,
        ...gotDescription,
    }
    
    const newDescription = await findOrCreate(Description, descriptionSchema)
    
    const modifying = {
        description: newDescription._id
    }
    
    await Car.updateOne({_id}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${_id} was found successful`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while updating the car: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to update the car images
exports.updateImages = async(req, res) => {
    upload(req, res, async function(error) {
        if(error) {
            console.log("Error in upload function")
            console.log(error)
            res.json({error: true})
            return
        }

        const {_id} = req.body
        const images = req.files

        if(!_id || !images) {
            console.log("Missing parameters")
            res.json({error: true})
            return
        }

        const carFound = await Car.findById(_id)
            .then((car) => {
                if(car == null) {
                    console.log("Not car found")
                    res.json({car: null})
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

            return image
        })

        const modifying = {images: arrayImages}

        await Car.updateOne({_id}, {$set: modifying})
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

// Function to delete a car
exports.deleteOne = async(req, res) => {
    const _id = req.body._id

    if(!_id) {
        console.log("Missing the id")
        res.json({error: true})
        return
    }

    await Car.findByIdAndDelete({_id})
        .then(car => {
            const images = car.images

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
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while deleting the car details: ${_id}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to delete many cars based on user's id
exports.deleteMany = async(req, res) => {
    const {_id} = req.body

    if(!_id) {
        console.log("Missing the user's id")
        res.json({error: true})
        return
    }

    await Car.deleteMany({user: _id})
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