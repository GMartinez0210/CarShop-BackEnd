const Cart = require("../../model/cart")

const { findOrCreate } = require("../../utilities/utils")
const { ErrorCart } = require("../../utilities/error")
const { cartCreateOne, cartDeleteOne, cartUpdateOne, 
    cartRead } = require("../../middleware/cart/cart")

// * Function to add a car to the user's cart
module.exports.createOne = async(req, res) => {
    const {user, car, quantity} = req.body

    if(!user || !car || !quantity) {
        const error = ErrorCart("No params given")
        res.status(400).json({error, create: false})
        return 
    }

    const options = {user, car, quantity}
    const {error, create} = await cartCreateOne(options)

    const status = !error ? 200 : 500
    
    res.status(status).json({error, create})
}

// * Function to remove a car from the user's cart
module.exports.deleteOne = async(req, res) => {
    const {user, car} = req.body

    if(!user || !car) {
        const error = ErrorCart("No params given")
        res.status(400).json({error, deleted: false})
        return
    }

    const options = {user, car}
    const {error, deleted} = await cartDeleteOne(options)

    const status = !error ? 200 : 500
    
    res.status(status).json({error, deleted})
}

// TODO Refactor and fix the updateOne
// * Function to update the quantity
module.exports.updateOne = async(req, res) => {
    const {user, car, quantity} = req.body

    if(!user || !car || !quantity) {
        const error = ErrorCart("No params given")
        res.status(400).json({error, update: false})
        return
    }

    const {error: cartError, item: cartItem} = await findOrCreate(Cart, {user})

    if(cartError) {
        res.status(500).json({error: cartError, update: false})
        return
    }

    const options = {user, cart: cartItem, car, quantity}

    const {error: cartUpdateError, update} = await cartUpdateOne(options)

    const status = !cartUpdateError ? 200 : 500

    res.status(status).json({error: cartUpdateError, update})
} 


// * Function to get all the cars which are in the cart
module.exports.getCarts = async(req, res) => {
    const {user} = req.query

    if(!user) {
        const error = ErrorCart("No _id given")
        res.status(400).json({error, cart: []})
        return 
    }

    const {error, cart} = await cartRead({user})

    const status = !error ? 200 : 500

    res.status(status).json({error, cart})
}