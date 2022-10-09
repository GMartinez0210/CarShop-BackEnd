//* Requiring the libraries
require("dotenv").config()
const bcrypt = require("bcrypt")

// * Instancing the custom errors
const {ErrorUser} = require("./error")

/**
 * It checks if an item exists in the database, if it doesn't, it creates it.
 * @param model - The model you want to find or create
 * @param schema - An object 
 * @returns An object with the error, if there's one, and the item found or created
 */
exports.findOrCreate = async(model, schema) => {
    const aux = schema.password
    schema.password = undefined
    schema = this.ObjectNotEmptyValues(schema)

    const { error: findError, 
        item: findItem } = await this.find(model, schema)

    if(findItem) {
        return { error: findError, item: findItem }
    }

    schema.password = aux

    const { error: createError, 
        item: createItem } = await this.create(model, schema)

    return { error: createError, item: createItem }
}

/**
 * It checks if an item exists in the database, if it does, 
 * it returns it; but if it doesn't, it'll return the error and item as null
 * If an error occurs, it'll return the error and the item as null.
 * @param model - The model you want to find or create
 * @param schema - The schema based on the model
 * @returns an object with an error and an item.
 */
 exports.find = async(model, schema) => {
    const {error, item} = await model.findOne(schema)
        .then(item => {
            if(!item) {
                console.log("Item doesn't exist")
                return {error: "No item found", item}
            }

            console.log("Item was found successful")
            return {error: null, item}
        })
        .catch(error => {
            console.log("Error while creating item") 
            return {error, item: null}
        })

    return {error, item}
}

/**
 * It saves an item into the database.
 * If an error occurs, it returns
 * @param model - The model you want to find or create
 * @param schema - The schema based on the model 
 * @returns an object with an error and an item.
 */
 exports.create = async(model, schema) => {
    const newItem = new model(schema)

    const {error, item} = await newItem.save()
        .then(item => ({error: null, item}))
        .catch(error => ({error, item: null}))

    return {error, item}
}

/**
 * It takes an object and returns a new object with only the key/value pairs that have a truthy value
 * @param schema - The object you want to filter
 * @returns an object without any empty value
 */
exports.ObjectNotEmptyValues = schema => {
    const entries = Object.entries(schema)
    const filtered = entries.filter(items => items[1])
    const object = Object.fromEntries(filtered) 

    return object 
}

/**
 * It takes a string and returns it after being hashed
 * @param string - the string that will be hashed
 */
exports.generateHash = string => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(string, salt)

    return hash
}