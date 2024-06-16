import mongoose from "mongoose";
import user from "./schemas/user.js";
import { compareHashcode } from "../validate/app_validate.js";

const dbUrl = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
mongoose.connect(dbUrl)

const saveAccount = async (data) => await new user(data).save()

const checkUserExist = async (email) => await user.exists({email: email})

const updateTokenToUserData = async (email, accessToken, refreshToken) => {
    let userdata = await user.findOne({email})
    if(!userdata) return null
    userdata.accessToken = accessToken
    userdata.refreshToken = refreshToken
    await user.updateOne({email: userdata.email}, {accessToken, refreshToken})
    return userdata
}

/**
 * get user data based our info
 * @param {data} data data of user
 * @returns user data or null
 */
const getUser = async (data) => {
    try {
        // const userdata = await user.findOne({email: data.email})
        // console.log(data.password)
        // console.log(userdata.password)
        // const isCorrectPassword = await compareHashcode(String(data.password), userdata.password)
        // console.log(isCorrectPassword)
        // if(isCorrectPassword) return userdata
        // else return null
        return await user.findOne(data)
    }catch(e) {
        console.log(e)
        return null
    }
}

export {saveAccount, checkUserExist, getUser, updateTokenToUserData}
