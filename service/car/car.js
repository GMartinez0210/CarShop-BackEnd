const multer = require("multer")
//const path = require("path")

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
exports.getCar = async (req, res) => {
    const CarDetails = require("../../model/carDetails")

    const _id = req.body._id

    const carFound = await CarDetails.findOne({_id})

    console.log(`Car Details Item with ID: ${_id} was found`)
    res.json({carDetails: carFound})
}

// Function to get all the cars
exports.getCars = async (req, res) => {
    const CarDetails = require("../../model/carDetails")

    const carsFound = await CarDetails.find()

    res.json({carDetails: carsFound})
}

// Function to add a car
exports.addCar = async (req, res) => {
    const User = require("../../model/user")
    const Image = require("../../model/image")
    const Brand = require("../../model/brand")
    const Car = require("../../model/car")
    const CarDetails = require("../../model/carDetails")
    
    upload(req, res, async function(error){
        if(error) {
            console.log("Error in upload function")
            console.log(error)
            res.json({error: true})
            return
        }

        try {
            const { licensePlate, brand, model,
                price, about, engine,
                gears, seats, user } = req.body
            const images = req.files

            const userFound = await User.findById(user)
                .catch(error => {
                    if(error) {
                        console.log(error)
                        res.json({error: true})
                    }
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
                    if (error) {
                        console.log(error)
                        return
                    }
    
                    console.log("Image saved successful")
                })
    
                return image
            })
            

            const brandSchema = {
                name: brand
            }

            const {created: createdBrand, error: errorBrand} = await findOrCreate(Brand, brandSchema)

            if(!createdBrand) {
                console.log(errorBrand)
                res.json({error: true})
                return
            }
            
            const carSchema = {
                brand: new Brand(brandSchema),
                model,
                engine,
                gears,
                seats
            }
            
            const {created: createdCar, error: errorCar} = await findOrCreate(Car, carSchema)
            
            if(!createdCar) {
                console.log(errorCar)
                res.json({error: true})
                return
            }
            
            const carDetails = new CarDetails({
                user,
                licensePlate,
                description: new Car(carSchema),
                images: arrayImages,
                price, 
                about
            })
    
            carDetails.save(error => {
                if (error) {
                    console.log(error)
                    return
                }
    
                console.log("Car details saved succesful")
            })
            res.json({carDetails})
        }
        catch (err) {
            console.log(err)
            res.json({error: true})
        }
    })
}

// Function to modify the car info
exports.modifyCarInfo = async (req, res) => {
    const CarDetails = require("../../model/carDetails")
    
    const _id = req.body._id
    const licensePlate = req.body.licensePlate
    const price = req.body.price 
    const about = req.body.about

    const modifying = {
        licensePlate,
        price,
        about
    }

    const carUpdated = await CarDetails.updateOne({_id}, {$set: modifying})
        .exec(async (error) => {
            if(error) {
                console.log(error)
                res.json({error: true})
                return
            }

            const carFound = await CarDetails.findById(_id)
                .exec((err, car) => {
                    if(err) {
                        console.log(err)
                        res.json({error: true})
                        return
                    }

                    res.json({carDetails: car})
                })
        })
}

// Function to modify the car description (model)
exports.modifyCarDescription = async (req, res) => {
    const Brand = require("../../model/brand")
    const Car = require("../../model/car")
    const CarDetails = require("../../model/carDetails")

    const _id = req.body._id
    const brand = req.body.brand
    const model = req.body.model
    const engine = req.body.engine
    const gears = req.body.gears
    const seats = req.body.seats

    const brandSchema = {
        name: brand
    }

    const {created: createdBrand, error: errorBrand} = await findOrCreate(Brand, brandSchema)

    if(!createdBrand) {
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
    
    const auxBrand = {brand: new Brand(brandSchema)}

    const {created: createdCar, error: errorCar} = await findOrCreate(Car, carSchema, auxBrand)

    if(!createdCar) {
        console.log("Error car: ")
        console.log(errorCar)
        res.json({error: true})
        return
    }

    const modifying = {brand: new Brand(brandSchema), ...carSchema}

    const carUpdated = await CarDetails.updateOne({_id}, {$set: modifying})
        .exec(async (error) => {
            if(error) {
                console.log("Error while updating car details: ")
                console.log(error)
                res.json({error: true})
                return
            }

            const carFound = await CarDetails.findById(_id)
                .exec((err, car) => {
                    if(err) {
                        console.log("Error while finding car details: ")
                        console.log(err)
                        res.json({error: true})
                        return
                    }

                    res.json({carDetails: car})
                })
        })

}

// Function to modify the car image
exports.modifyCarImage = async (req, res) => {
    upload(req, res, async function(error) {
        if(error) {
            console.log("Error in upload function")
            console.log(error)
            res.json({error: true})
            return
        }

        const fs = require("fs")
        const Image = require("../../model/image")
        const CarDetails = require("../../model/carDetails")

        try {
            const _id = req.body._id
            const images = req.files

            const carFound = await CarDetails.findById(_id)

            const {images: arrayCarImages} = carFound

            try {
                arrayCarImages.forEach(async(_id) => {
                    const image = await Image.findOne({_id})
                    fs.unlinkSync("./image/car/"+image.name)
                    await Image.deleteOne({_id})
                })
            } 
            catch (error2) {
                console.log(error2)
                res.json({error: true})
                return
            }

            const arrayImages = images.map(imageUploaded => {
                const image = new Image({
                    name: imageUploaded.filename,
                    image: {
                        data: imageUploaded.filename,
                        contentType: imageUploaded.mimetype
                    }
                })
    
                image.save(error => {
                    if (error) {
                        console.log(error)
                        return
                    }
    
                    console.log("Image saved successful")
                })
    
                return image
            })

            const modifying = {images: arrayImages}

            await CarDetails.updateOne({_id}, {$set: modifying})

            const updatedCarFound = await CarDetails.findById(_id)

            res.json({carDetails: updatedCarFound})
        } 
        catch (error) {
            console.log("Catch error: ")
            console.log(error)
            res.json({error: true})
        }
    })
}

// Function to remove a car
exports.removeCar = async (req, res) => {
    const CarDetails = require("../../model/carDetails")

    const _id = req.body._id

    await CarDetails.deleteOne({_id})

    console.log(`Car Details Item with ID: ${_id} was deleted`)
    res.json({success: true, _id: _id})
}

// Function find or create 
async function findOrCreate (model, schema, aux) {
    try {
        const modelFound = await model.findOne(schema)
            .exec(async (error, itemFound) => {
                if (error) {
                    console.log("Error while finding item: ")
                    console.log(error)
                    return false
                }
        
                if (itemFound != null) {
                    console.log("Item found sucessful")
                    return itemFound
                }

                let newItem = {}

                if(aux == undefined 
                || aux == null) newItem = new model(schema)
                else newItem = new model({...schema, ...aux})

                const item = await newItem.save(err => {
                    if (err) {
                        console.log("Error while saving item: ")
                        console.log(err)
                        return false
                    }
        
                    console.log("Item created successful")
                    return newItem
                })
            })
        return {created: true}
    } 
    catch (error) {
        console.log("Inside the find or create: ")
        console.log(error)
        return {error}
    }
}