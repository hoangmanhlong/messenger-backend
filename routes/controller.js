import express from "express";
import { verityAccessToken } from '../jwt/index.js';
import profileRoute from './profile.js'
import loginRoute from './login.js'

const route = express.Router();
const authorization = (req, res, next) => verityAccessToken(req, res, next);

route.use('/auth', loginRoute)
route.use('/profile', authorization, profileRoute)

export default route