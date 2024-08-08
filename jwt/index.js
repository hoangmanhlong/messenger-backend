import jwt from 'jsonwebtoken'
import { updateTokenToUserData } from '../db/db.js'
import Constant from '../constant/constant.js'

export async function generateAccessToken(payload) {
    try {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: Constant.TOKEN_EXPIRATON_TIME })
    } catch (e) {
        return null
    }
}

export async function generateRefreshToken(payload) {
    try {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
    } catch (e) {
        return null
    }
}

export async function verityAccessToken(req, res, next) {
    try {
        const bearer_token = req.body.access_token
        const access_token = bearer_token.split(' ')[1]
        jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, (error, data) => {
            if (error) {
                updateTokenToUserData(req.body.email, null, null)
                return res.sendStatus(403)
            }
            req.data = data
            next()
            return
        })
    } catch (e) {
        return res.sendStatus(403)
    }
}