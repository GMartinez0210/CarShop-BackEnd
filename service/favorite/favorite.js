// ! ERROR => Using the last findOrCreate from utilities.js
const { findOrCreate } = require("../../utilities/utils")

const Favorite = require("../../model/favorite")
const Car = require("../../model/car")

const { favoriteCreateOne } = require("../../middleware/favorite/favorite")
const { ErrorFavorite } = require("../../utilities/error")

// Function to add a car to the user favorite cars
module.exports.createOne = async(req, res) => {
    const {user, car} = req.body

    if(!user || !car) {
        const error = ErrorFavorite("No params given")
        res.status(400).json({error, create: false})
        return
    }

    const options = {user, car}
    const {error, create} = await favoriteCreateOne(options)

    const status = !error ? 200 : 500
    
    res.status(status).json({error, create})
}

module.exports.addOne = async(req, res) => {
    const {user, car} = req.body
    
    const favorite = await findOrCreate(Favorite, {user})

    const modifying = {
        car: [...favorite.car, car]
    }

    await Favorite.updateOne({user}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${car} was added as a favorite successful by user: ${user}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while adding the car ${car} as fav of user: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to remove a car from the user favorite cars
module.exports.removeOne = async(req, res) => {
    const {user, car} = req.body
    console.log("User and Car values")
    console.log(user, car)

    const favorite = await findOrCreate(Favorite, {user})

    const modifying = {
        car: favorite.car.filter(item => item != car)
    }

    await Favorite.updateOne({user}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${car} was removed as a favorite successfull by user: ${user}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while removing car ${car} as fav of user: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to check if it's a favorite
module.exports.check = async(req, res) => {
    const {user, car} = req.query

    await Favorite.findOne({user})
        .then(favorites => {
            if(favorites == null) {
                console.log(`No favorites for the user: ${user}`)
                res.json({favorite: null})
                return
            }

            console.log(`Favorites were found of user: ${user}`)
            
            const isFavorite = favorites.car.some(car)

            if(!isFavorite){
                res.json({favorite: false})
                return
            }

            res.json({favorite: true})            
        })
        .catch(error => {
            console.log(`Error while finding the favorites of the iser: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to get all the favorite cart based on the user
module.exports.getFavoriteCars = async(req, res) => {
    const {user} = req.query

    const favorites = await Favorite.findOne({user})
        .then(favorites => {
            if(favorites == null) {
                console.log(`No favorites for the user: ${user}`)
                res.json({favorites: null})
                return null
            }

            console.log(`Favorites were found of user: ${user}`)
            return favorites
        })
        .catch(error => {
            console.log(`Error while finding the favorites of the user: ${user}`)
            console.log(error)
            res.json({error: true})
            return null
        })

    if(!favorites) return

    res.json({favorites})
}