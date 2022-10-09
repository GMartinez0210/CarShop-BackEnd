// * Requiring some modules
const fs = require("fs")

// * Requiring some models
const Photo = require("../../model/photo")

// * Requiring the utils functions
const utils = require("../../utilities/utils")

// * Function to create a new photo
/**
 * Function to create a photo, inserting it into the database
 * @param schema - An object based on the photo's schema 
 * @returns returns an object of all the data about the photo recently created 
 */
module.exports.photoCreateOne = async(schema) => {
    const {error, item: photo} = await utils.create(Photo, schema)
    return {error, photo}
}


// * Function to find and delete photos
/**
 * A function which find a user photo by its _id and delete it
 * @param _id - An String or an Array of the user's photo ids 
 * @returns An object with all the photo information 
 */
module.exports.photoFindByIdAndDelete = async(_id) => {
    const photo = await Photo.findByIdAndDelete(_id)
        .then(photo => {
            fs.unlinkSync("./image/profile/"+photo.name)
            return {error: null, ...photo._doc}
        })
        .catch(error => ({error, photo: null}))

    return photo
}