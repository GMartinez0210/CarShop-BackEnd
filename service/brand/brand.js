const Brand = require("../../model/brand")

exports.readAll = async(req, res) => {
    await Brand.find()
        .then(brands => {
            if(!brands) {
                console.log("No brands")
                res.json({brands: null})
                return
            }

            console.log("Brands were found successful")
            res.json({brands})
        })
        .catch(error => {
            console.log("Error while finding the brands")
            console.log(error)
            res.json({error: true})
        })
}