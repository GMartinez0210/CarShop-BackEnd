const multer = require("multer")

const storage = multer.diskStorage({
    destination: "image/car",
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`)
    }
})

const upload = multer({
    storage: storage
}).array("images", 5)

// Function to get the cars
exports.getCar = function(req, res) {

}

// Function to add a car
exports.addCar = function(req, res) {
    const Image = require("../../model/image")
    const Brand = require("../../model/brand")
    const Car = require("../../model/car")
    const CarDetails = require("../../model/carDetails")
    
    upload(req, res, function(error){
        if(error) {
            console.log(error)
            res.json({error: true})
            return
        }

        try {
            const licensePlate = req.body.licensePlate
            const brand = req.body.brand
            const model = req.body.model
            const images = req.files
            const price = req.body.price
            const about = req.body.about
            const engine = req.body.engine
            const gears = req.body.gears
            const seats = req.body.seats
    
            const arrayImages = images.map(imageUploaded => {
                const image = new Image({
                    name: imageUploaded.filename,
                    image: {
                        data: imageUploaded.filename,
                        contentType: imageUploaded.mimetype
                    }
                })
    
                image.save(error => {
                    if (error) {
                        console.log(error)
                        return
                    }
    
                    console.log("Image saved successful")
                })
    
                return image
            })
    
            const carBrand = new Brand({
                name: brand
            })
    
            carBrand.save(error => {
                if (error) {
                    console.log(error)
                    return
                }
    
                console.log("Brand saved succesful")
            })
    
            const car = new Car({
                brand: carBrand,
                model,
                engine,
                gears,
                seats
            })
    
            car.save(error => {
                if (error) {
                    console.log(error)
                    return
                }
    
                console.log("Car saved succesful")
            })
    
            const carDetails = new CarDetails({
                licensePlate,
                description: car,
                images: arrayImages,
                price, 
                about
            })
    
            carDetails.save(error => {
                if (error) {
                    console.log(error)
                    return
                }
    
                console.log("Car details saved succesful")
            })
            res.json({carDetails})
        }
        catch (err) {
            console.log(err)
        }
    })
}

// Function to modify a car
exports.modifyCar = function() {

}

// Function to remove a car
exports.removeCar = function() {

}