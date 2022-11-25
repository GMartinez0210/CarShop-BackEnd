// * ITEM ERROR
class ItemError extends Error {
    constructor(message) {
        super(message)
        this.name = "Item Error"
    }
}

/**
 * A function which creates an error for items not specified. 
 * @param message - The text that will be displayed in the error 
 * @returns An error from the class ItemError
 */
module.exports.ErrorItem = message => {
    const error = new ItemError(message)
    return error
}

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
 * @returns An error from the class UserError
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
 * @returns An error from the class PhotoError
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
 * @returns An error from the class CarError
 */
module.exports.ErrorCar = message => {
    const error = new CarError(message)
    return error
}

// * IMAGE ERROR
class ImageError extends Error {
    constructor(message) {
        super(message)
        this.name = "Image Error"
    }
}

/**
 * A function which creates an error for images
 * @param message - The text that will be displayed in the error 
 * @returns An error from the class PhotoError
 */
module.exports.ErrorImage = message => {
    const error = new ImageError(message)
    return error
}

// * CART ERROR
class CartError extends Error {
    constructor(message) {
        super(message)
        this.name = "Cart Error"
    }
}

/**
 * A function which creates an error for carts
 * @param message - The text that will be displayed in the error 
 * @returns An error from the class CartError
 */
module.exports.ErrorCart = message => {
    const error = new CartError(message)
    return error
}

// * FAVORITE ERROR
class FavoriteError extends Error {
    constructor(message) {
        super(message)
        this.name = "Favorite Error"
    }
}

/**
 * A function which creates an error for favorites
 * @param message - The text that will be displayed in the error 
 * @returns An error from the class FavoriteError
 */
module.exports.ErrorFavorite = message => {
    const error = new FavoriteError(message)
    return error
}