// * Requiring some modules
const fs = require("fs")

// * Requiring some models
const Image = require("../../model/image")
const { ErrorImage } = require("../../utilities/error")

module.exports.imagesCreateManySchemas = imageArray => {
    const images = imageArray?.map(imageDocument => {
        const image = new Image({
            name: imageDocument.filename,
            image: {
                data: imageDocument.filename,
                contentType: imageDocument.mimetype
            }
        })
        return image 
    })

    return images
}

module.exports.imageCreateMany = async(imageArray) => {
    const {error, images} = await Image.insertMany(imageArray)
        .then(images => ({error: null, images}))
        .catch(error => ({error, images: []}))

    return {error, images}
}

module.exports.imageDeleteManyFromFolder = imagesArray => {
    const response = {
        error: null,
        deleted: null
    }

    try {
        imagesArray?.forEach(name => {
            const path = "./image/car/"+name
            fs.unlinkSync(path, err => {
                if (err) {
                    throw ErrorImage("Error while deleting the images from the folder")
                }  
            })
        })

        response.deleted = true
    } 
    catch (err) {
        response.error = err
    }
    
    return response
}

module.exports.imageDeleteMany = async(options) => {
    const {error, deleted} = Image.deleteMany(options)
        .then(deleted => ({error: null, deleted: deleted.acknowledged}))
        .catch(error => ({error, deleted: false}))

    return {error, deleted}
}