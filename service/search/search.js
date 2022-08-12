const User = require("../../model/user")
const Car = require("../../model/car")

exports.searchCar = async(req, res) => {
    const {brand, model} = req.query

    console.log(brand, model)

    const options = {
        brand: brand && RegExp(brand),
        model: model && RegExp(model)
    }

    const search = Object.fromEntries(Object.entries(options)
        .filter(value => value[1]))

    console.log(options)
    console.log(search)

    await Car.find(search)
        .then(car => {
            if(car == null || car.length == 0) {
                console.log("No car found")
                res.json({car: null})
                return
            }

            console.log("All cars found")
            res.json({car})
        })
        .catch(error => {
            console.log("Error while searching the cars")
            console.log(error)
            res.json({error: true})
        })
}

exports.searchCarByUser = async(req, res) => {
    const {_id} = req.query

    await Car.find({user: _id})
        .then(car => {
            if(car == null || car.length == 0) {
                console.log("No car found")
                res.json({car: null})
                return
            }

            console.log("All cars found")
            res.json({car})
        })
        .catch(error => {
            console.log("Error while searching the cars")
            console.log(error)
            res.json({error: true})
        })
}