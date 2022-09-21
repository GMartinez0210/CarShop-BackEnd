const Cart = require("../../model/cart")

const Image = require("../../model/image")
const Brand = require("../../model/brand")
const Description = require("../../model/description")
const Car = require("../../model/car")

const { findOrCreate } = require("../../utilities")

// Function to add a car to the user's cart
exports.addOne = async(req, res) => {
    const {user, car, quantity} = req.body

    console.log(req.body)

    if(!user || !car || !quantity) {
        console.log("Missing (a) pamater(s)")
        res.status(400).json({error: true})
        return
    }

    const cart = await findOrCreate(Cart, {user})

    const modifying = {
        cars: [
            ...cart.cars, 
            {
                car,
                quantity: +quantity
            }
        ]
    }

    await Cart.updateOne({user}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${car} was added to the cart successful by user: ${user}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while adding the car ${car} to the cart of user: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to remove a car from the user's cart
exports.removeOne = async(req, res) => {
    const {user, car} = req.body

    console.log(req.body)

    if(!user || !car) {
        console.log("Missing (a) pamater(s)")
        res.json({error: true})
        return
    }

    const cart = await findOrCreate(Cart, {user})

    const modifying = {
        cars: cart?.cars.filter(item => item.car != car)
    }

    await Cart.updateOne({user}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${car} was removed from the cart successful by user: ${user}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while removing the car ${car} to the cart of user: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to update the quantity 
exports.updateOne = async(req, res) => {
    const {user, car, quantity} = req.body

    if(!user || !car || !quantity) {
        console.log("Missing (a) pamater(s)")
        res.json({error: true})
        return
    }

    const cart = await findOrCreate(Cart, {user})
    
    const newCart = cart?.cars.map(item => {
        if(item.car == car) {
            return {
                ...item,
                quantity: +quantity
            }
        }

        return item
    })

    const modifying = {
        ...cart._doc,
        cars: newCart
    }

    await Cart.updateOne({user}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${car} quantity was updated by user: ${user}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while updating the car ${car} quantity by user: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to get all the cars which are in the cart
exports.getCartCars = async(req, res) => {
    const {user} = req.query

    if(!user) {
        console.log("No user parameter given")
        res.status(400).json({cart: [], totalPrice: 0})
        return
    }

    const cart = await Cart.findOne({user})
        .then(carts => {
            if(!carts) {
                console.log(`No cars in the cart of user: ${user}`)
                res.json({cart: []})
                return
            }

            console.log(`Cars in the cart were found of user: ${user}`)
            return carts
        })
        .catch(error => {
            console.log(`Error while finding the cars on the car of the user: ${user}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!cart) return

    const _id = cart.cars.map(item => item.car) 

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

    const cartAllData = []

    carAndImages.forEach(carAndImage => {
        cart.cars.forEach(cartItem => {
            if(cartItem.car.toString() == carAndImage._id.toString()) {
                const aux = {
                    ...carAndImage,
                    quantity: cartItem.quantity,
                    description: undefined
                }

                cartAllData.push(aux)
            }
        })
    })

    let totalPrice = 0

    cartAllData.forEach(carItem => {
        totalPrice += (carItem.price * carItem.quantity) 
    })

    res.json({cars: cartAllData, totalPrice})
}