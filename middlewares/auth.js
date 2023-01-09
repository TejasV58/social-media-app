const jwt = require('jsonwebtoken')
const User = require('../models/user')
require("dotenv").config();

const auth = async (req,res,next) => {
    try{
        const authHeader = req.headers["authorization"]
        const token = authHeader && authHeader.split(' ')[1]
        if(token===null) throw "Authorization header missing"

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token' : token })

        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        next()

    } catch(e) {
        res.status(401).send({ error: 'Please Authenticate'})
    }
}

module.exports = auth