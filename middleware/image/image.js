// * Requiring some modules
const fs = require("fs")

// * Requiring some models
const Image = require("../../model/image")

// * Requiring the utils functions
const utils = require("../../utilities/utils")

// * Function to create a new image
/**
 * Function to create a image, inserting it into the database
 * @param schema - An object based on the image's schema 
 * @returns returns an object of all the data about the image recently created 
 */
module.exports.imageCreateOne = async(schema) => {
    const {error, item: image} = await utils.create(Image, schema)
    return {error, image}
}


// * Function to find and delete images
/**
 * A function which find a user image by its _id and delete it
 * @param _id - An String or an Array of the user's image ids 
 * @returns An object with all the image information 
 */
module.exports.imageFindByIdAndDelete = async(_id) => {
    const image = await Image.findByIdAndDelete(_id)
        .then(image => {
            fs.unlinkSync("./image/profile/"+image.name)
            return {error: null, ...image._doc}
        })
        .catch(error => ({error, image: null}))

    return image
}