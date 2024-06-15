import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: new Date().getTime().toString(),
        immutable: true
    },
    email: {
        type: String,
        require: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 6
    },
    createAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    accessToken: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    }
})

export default mongoose.model('User', userSchema)