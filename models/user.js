const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config();

const userSchema = mongoose.Schema({
     userName:{
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 30,
        unique: true
     },
     email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Incorrect Email id')
            }
        }
     },
     password:{
         type: String,
         required: true,
         trim:true,
         minLength: 6,
         validate(value){
             if(value.toLowerCase().includes("password")){
                 throw new Error('Password cannot have word password')
             }
         }
     },
     followers:{
        type: Array,
        default:[]
     },
     followings:{
        type: Array,
        default:[]
     },
     tokens:[{
            token:{
                type: String,
                required: true
            }
        }],
},{
    timestamps:true
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw "User not found!";
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw "Wrong password!";
    }
    return user
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id:user.id.toString() }, process.env.ACCESS_TOKEN_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

const User = new mongoose.model('User', userSchema)
module.exports = User