import jwt from 'jsonwebtoken'

export async function generateAccessToken(payload) {
    try {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
    }catch(e) {
        return null
    }
}

export async function generateRefreshToken(payload) {
    try {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
    }catch(e) {
        return null
    }
}

export async function verityAccessToken(req, res, next) {
    try {
        const bearer_token = req.body.access_token
        const access_token = bearer_token.split(' ')[1]
        jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, (error, data) => {
            if(error) return res.sendStatus(403)
            req.data = data
            next()
        })
    }catch(e) {
        return res.sendStatus(403)
    }
}