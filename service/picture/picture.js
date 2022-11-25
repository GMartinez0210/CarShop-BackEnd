const path = require("path")

const Photo = require("../../model/photo")
const Image = require("../../model/image")

module.exports.getPhoto = async(req, res) => {
    const name = req.params.name
    const photofound = await Photo.findOne({name})
    
    if(photofound == null) {
        res.send("")
        return
    }

    const {name: photo} = photofound

    const photoPath = path.join(__dirname,"../../image/profile", photo)

    res.sendFile(photoPath)
}

module.exports.getImage = async(req, res) => {
    const name = req.params.name
    const imagefound = await Image.findOne({name})

    if(imagefound == null) {
        res.send("")
        return
    }

    const {name: image} = imagefound

    const imagePath = path.join(__dirname,"../../image/car", image)

    res.sendFile(imagePath)
}