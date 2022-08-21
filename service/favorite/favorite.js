const Favorite = require("../../model/favorite")
const Car = require("../../model/car")

// Function to add a car to the user favorite cars
exports.addOne = async(req, res) => {
    const {user, car} = req.body
    
    const favorite = await findOrCreate(Favorite, {user})

    const modifying = {
        car: [...favorite.car, car]
    }

    await Favorite.updateOne({user}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${car} was added as a favorite successfull by user: ${user}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while adding car ${car} as fav of user: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to remove a car from the user favorite cars
exports.removeOne = async(req, res) => {
    const {user, car} = req.body
    console.log("User and Car values")
    console.log(user, car)

    const favorite = await findOrCreate(Favorite, {user})

    const modifying = {
        car: favorite.car.filter(item => item != car)
    }

    await Favorite.updateOne({user}, {$set: modifying})
        .then(() => {
            console.log(`Car: ${car} was added as a favorite successfull by user: ${user}`)
            res.json({error: false})
        })
        .catch(error => {
            console.log(`Error while adding car ${car} as fav of user: ${user}`)
            console.log(error)
            res.json({error: true})
        })
}

// Function to check if it's a favorite
exports.check = async(req, res) => {
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

exports.getFavoriteCars = async(req, res) => {
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

async function findOrCreate(model, schema) {
    const item = await model.findOne(schema)
        .then(itemFound => {
            if(itemFound == null) {
                console.log("Item doesn't exist")
                return null
            }

            console.log("Item was found successful")
            return itemFound
        })
        .catch(error => {
            console.log("Error while creating item")
            console.log(error)
            return null
        })

    if(item != null) {
        return item
    }

    const newItem = new model(schema)
    await newItem.save()

    return newItem
}