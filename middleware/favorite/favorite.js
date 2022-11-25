// TODO refactor the entire favorite service
const Favorite = require("../../model/favorite")
const { findOrCreate, ObjectNotEmptyValues, updateOne } = require("../../utilities/utils")

module.exports.favoriteCreateOne = async(params) => {
    const {user, car} = params
    const {error: favoriteError, item: favoriteItem} = await findOrCreate(Favorite, {user})

    if(favoriteError) {
        return {error: favoriteError, create: false}
    }

    const filterUpdate = {_id: favoriteItem._id, user: favoriteItem.user}
    const optionsUpdate = {cars: [...favoriteItem?.cars, car]}

    const paramsUpdate = {
        model: Favorite,
        filter: filterUpdate,
        options: optionsUpdate
    }
    const {error, update: create} = await updateOne(paramsUpdate)
 
    return {error, create}
}

// TODO Missing the update and delete action from favorite service
// TODO Check the whole project out to change the updateOne function
// TODO to the new re-usable updateOne function from utils 
// TODO Review the code to look for repeat parts to refactor it