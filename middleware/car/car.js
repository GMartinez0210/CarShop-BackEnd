// * Instancing the models
const Car = require("../../model/car")

// * Instancing the custom errors
const { ObjectNotEmptyValues } = require("../../utilities/utils")
const { ErrorCar } = require("../../utilities/error")

// * Function to creare a car
module.exports.carCreateOne = async(params) => {
    // ? Empty because I haven't found 
    // ? the way how to recode this service 
}

module.exports.carRead = async(params) => {
    const filter = ObjectNotEmptyValues(params)

    const {error, cars} = await Car.aggregate([
        {
            $match: filter
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
            $lookup: {
                from: "brands",
                localField: "description.brand",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $unwind: "$brand"
        },
        {
            $lookup: {
                from: "images",
                localField: "images",
                foreignField: "_id",
                as: "images"
            }
        },
        {
            $project: {
                _id: "$_id",
                user: "$user",
                licensePlate: "$licensePlate",
                images: "$images.name",
                brand: "$brand.name",
                model: "$description.model",
                engine: "$description.engine",
                gears: "$description.gears",
                seats: "$description.seats",
                price: "$price",
                about: "$about"
            }
        }
    ])
    .then(car => {
        const error = !car.length
            ? ErrorCar("There's no cars")
            : null
        
        return {error, cars: car}
    })
    .catch(error => {
        console.log(error)
        return {error, cars: []}
    })

    return {error, cars}
}

module.exports.carUpdateOne = async(params) => {
    const {_id} = params
    params._id = undefined
    const options = ObjectNotEmptyValues(params)

    const update = await Car.updateOne({_id}, {$set: options})
        .then(updated => ({error: null, update: updated.acknowledged}))
        .catch(error => ({error, update: false}))

    return update
}

module.exports.carDeleteOne = async(_id) => {
    const deleted = await Car.deleteOne(_id)
        .then(deleted => ({error: null, deleted: deleted.acknowledged}))
        .catch(error => ({error, deleted: false}))

    return deleted
}

module.exports.carDeleteMany = async(options) => {
    const deleted = await Car.deleteMany(options)
        .then(deleted => ({error: null, deleted: deleted.acknowledged}))
        .catch(error => ({error, deleted: false}))

    return deleted
}