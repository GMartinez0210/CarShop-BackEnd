const Image = require("../../model/image")
const Brand = require("../../model/brand")
const Description = require("../../model/description")
const Car = require("../../model/car")

// Function to read cars based on the user's id
exports.byUser = async(req, res) => {
    const {_id} = req.query

    if(!_id) {
        console.log("No parameter given")
        res.json({error: true})
        return
    }

    const cars = await Car.find({user: _id})
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

// Function to read cars based on the brand
exports.byBrand = async(req, res) => {
    const gotBrandName = req.query.brand 

    const brands = await Brand.find({name: RegExp(gotBrandName)})
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

// Function to read cars based on the brand and model
exports.byBrandAndModel = async(req, res) => {
    const gotBrandName = req.query.brand
    const gotModelName = req.query.model

    const brands = await Brand.find({name: RegExp(gotBrandName)})
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

    const descriptions = await Description.find({
        brand: brandIDs, 
        model: RegExp(gotModelName)
        })
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