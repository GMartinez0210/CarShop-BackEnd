/**
 * It checks if an item exists in the database, if it doesn't, it creates it.
 * @param model - The model you want to find or create
 * @param schema - An object 
 * @returns a promise.
 */
module.exports.findOrCreate = async (model, schema) => {
    const item = await model.findOne(schema)
        .then(itemFound => {
            if(itemFound == null) {
                console.log("Item doesn't exist")
                return null
            }

            console.log("Item was found successful")
            return itemFound
        })
        .catch(error => {
            console.log("Error while creating item")
            console.log(error)
            return null
        })

    if(item != null) return item

    const newItem = new model(schema)
    await newItem.save()

    return newItem
}