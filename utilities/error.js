// * USER ERROR
class UserError extends Error {
    constructor(message) {
        super(message)
        this.name = "User Error"
    }
}

/**
 * A function which creates an error for users
 * @param message - The text that will be displayed in the error 
 * @returns - An error from the class UserError
 */
module.exports.ErrorUser = message => {
    const error = new UserError(message)
    return error
}

// * PHOTO ERROR
class PhotoError extends Error {
    constructor(message) {
        super(message)
        this.name = "Photo Error"
    }
}

/**
 * A function which creates an error for photos
 * @param message - The text that will be displayed in the error 
 * @returns - An error from the class PhotoError
 */
module.exports.ErrorPhoto = message => {
    const error = new PhotoError(message)
    return error
}

// * CAR ERROR
class CarError extends Error {
    constructor(message) {
        super(message)
        this.name = "Car Error"
    }
}

/**
 * A function which creates an error for car
 * @param message - The text that will be displayed in the error 
 * @returns - An error from the class CarError
 */
module.exports.ErrorCar = message => {
    const error = new CarError(message)
    return error
}