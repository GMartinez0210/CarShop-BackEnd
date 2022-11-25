const Cart = require("../../model/cart")
const { ErrorCart } = require("../../utilities/error")

const { findOrCreate, ObjectNotEmptyValues } = require("../../utilities/utils")

module.exports.cartCreateOne = async(params) => {
    const {user, car, quantity} =  params

    const {error: cartError, item: cart} = await findOrCreate(Cart, {user})

    if(cartError) {
        return {error: cartError, create: false}
    }

    const paramsCarInCart = {user, car}

    const {error: carInCartError, carInCart: carInCartBool} = await this.carInCart(paramsCarInCart)

    if(carInCartError || carInCartBool) {
        return {error: carInCartError, create: false}
    }

    const filterUpdate = {_id: cart, user}
    const optionsUpdate = {cars: [...cart?.cars, {car, quantity}]}

    const {error, update: create} = await this.cartUpdate(filterUpdate, optionsUpdate)
    
    return {error, create}
}

module.exports.cartRead = async(params) => {
    const filter = ObjectNotEmptyValues(params)

    const {error, cart} = await Cart.aggregate([
        {
            $match: filter
        },
        {
          $unwind: "$cars"  
        },
        {
            $project: {
                _id: 1,
                user: 1,
                car: "$cars.car",
                quantity: "$cars.quantity"
            }
        },
        {
            $lookup: {
                from: "cars",
                localField: "car",
                foreignField: "_id",
                as: "car"
            }
        },
        {
            $unwind: "$car"
        },
        {
            $project: {
                _id: 1,
                user: 1,
                quantity: 1,
                car: "$car._id",
                licensePlate: "$car.licensePlate",
                images: "$car.images",
                description: "$car.description",
                price: "$car.price",
                about: "$car.about"
            }
        },
        {
            $lookup: {
                from: "descriptions",
                localField: "description",
                foreignField: "_id",
                as: "description"
            }
        },
        {
            $unwind: "$description"
        },
        {
            $project: {
                _id: 1,
                user: 1,
                quantity: 1,
                car: 1,
                licensePlate: 1,
                images: 1,
                brand: "$description.brand",
                model: "$description.model",
                engine: "$description.engine",
                gears: "$description.gears",
                seats: "$description.seats",
                price: 1,
                about: 1
            }
        }
    ])
    .then(cart => {
        const error = !cart.length
            ? ErrorCart("There's no carts")
            : null
        
        return {error, cart}
    })
    .catch(error => ({error, cart: []}))

    return {error, cart}
}

module.exports.cartUpdateOne = async(params) => {
    const {user, cart, car, quantity} = params

    const cars = cart.cars?.map(carItem => 
        carItem.car == car
        ? {car, quantity}
        : carItem )

    const options = {cars}

    const filter = {_id: cart, user}

    const {error, update} = await Cart.updateOne(filter, {$set: options})
        .then(updated => ({error: null, update: updated.acknowledged}))
        .catch(error => ({error, update: false}))

    return {error, update}
}

module.exports.cartDeleteOne = async(params) => {
    const {user, car} =  params

    const {error: cartError, item: cart} = await findOrCreate(Cart, {user})

    if(cartError) {
        return {error: cartError, deleted: false}
    }
    
    const filter = {cart, user}
    const options = {cars: cart?.cars.filter(item => item.car != car)}

    const {error: carDeletedError, update: deleted} = await this.cartUpdate(filter, options)

    return {error: carDeletedError, deleted}
}

module.exports.cartUpdate = async(filter, options) => {
    const {error, update} = await Cart.updateOne(filter, {$set: options})
        .then(updated => ({error: null, update: updated.acknowledged}))
        .catch(error => ({error, update: false}))

    return {error, update}
}

module.exports.carInCart = async(params) => {
    const filter = ObjectNotEmptyValues(params)

    const {user, car} = filter

    const {error: cartError, cart: cartItem} = await this.cartRead({user})

    if(cartError) {
        return {error: cartError, carInCart: false}
    }

    const carInCart = cartItem?.some(item => item.car == car)

    return {error: null, carInCart}
}