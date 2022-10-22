// * Instancing the models
const User = require("../../model/user")

// * Intancing the custom errors
const {ErrorUser} = require("../../utilities/error")

// * Instancing the utities
const {ObjectNotEmptyValues, findOrCreate, 
    generateHash} = require("../../utilities/utils")

// * Function to create a user
/**
 * A function which creates a user 
 * @param params - An object which has the fullname, email and password properties
 * @returns - Returns an object. The user data and an error if it exists
 */
module.exports.userCreateOne = async(params) => {
    const {fullname, email, password} = params

    if(!fullname || !email || !password) {
        const errorMessage = "Missing a parameter in create() function from user's middleware"
        const error = ErrorUser(errorMessage)
        return {error, user: []} 
    }
    
    const hash = generateHash(password)
    
    const userSchema = {fullname, email, password: hash}

    const {error, item: user} = await findOrCreate(User, userSchema)

    return {error, user}
}

// * Function to read users depending on the filters
/**
 * A function which reads the user data, but not the password
 * @param params - An object of the filters for the request 
 * @returns An object with the error and an array of users
 */
module.exports.userRead = async(params) => {
    const filter = ObjectNotEmptyValues(params)
    const fields = {password: 0}

    const user = await User.find(filter, fields)
        .then(userFound => {
            if(!userFound.length) {
                return {
                    error: ErrorUser("Error while finding the user(s)"),
                    users: []
                }
            }

            return {error: null, users: userFound}
        })
        .catch(() => {
            return {
                error: ErrorUser("Error while finding the user(s)"),
                users: []
            }
        })

    return user
}

// *  Function to update a user information
/**
 * Updates the user information based on the query given
 * @param params - An object with all the new data
 * @returns An object with the error, if there's any, and a boolean value with the update key  
 */
module.exports.userUpdateOne = async(params) => {
    const {_id} = params
    params._id = undefined
    const options = ObjectNotEmptyValues(params)

    const update = await User.updateOne({_id}, {$set: options})
        .then(updated => {
            console.log(`User ${_id} was updated`)
            return {error: null, update: updated.acknowledged}
        })
        .catch(error => {
            console.log(`Error while updating the user ${_id}`)
            console.log(error)
            return {error, update: false}
        })

    return update
}

// * Function to delete a user based on his _id
/**
 * Deletes a user from the database according the _id passed
 * @param _id - an
 * @returns 
 */
module.exports.userDeleteOne = async(_id) => {
    const user = await User.findByIdAndDelete(_id)
        .then(user => ({error: null, user}))
        .catch(error => ({error, user: null}))

    return user
}