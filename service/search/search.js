const User = require("../../model/user")
const Image = require("../../model/image")
const CarDetails = require("../../model/carDetails")

exports.searchCarByName = async(req, res) => {
    const {brand, model} = req.query

    /*
    const options = {
        brand: brand || "",
        model: model || ""
    }
    */

    const options = {
        brand: "Lamborghini",
        model: "Huracan EVO RWD",
        engine: "5.2-litre Naturally Aspirated V10",
        gears: "Automatic",
        seats: 2,
        //_id: "62f348195071e65a5091d4f0"
    }

    await CarDetails.find().where("description").in(options)
        .then(carDetails => {
            if(carDetails == null || carDetails.length == 0) {
                console.log("No car found")
                res.json({carDetails: null})
                return
            }

            console.log("All car details found")
            res.json({carDetails})
        })
        .catch(error => {
            console.log("Error while searching the cars")
            console.log(error)
            res.json({error: true})
        })
}