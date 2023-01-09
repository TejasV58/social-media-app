const express = require('express')
const User = require('../models/user')
const router = new express.Router()

const auth = require('../middlewares/auth')

// to create a new user
router.post('/api/register', async (req, res) => {
    const user = User(req.body)
    try{
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send({ error: e });
    }
})

// authenticate a registered user
router.post('/api/authenticate', async (req,res) => {
    try{
        const user = await User.findByCredentials( req.body.email, req.body.password );
        const token = await user.generateAuthToken()
        res.send({ token })
    } catch(e) {
        res.status(400).send({ error: e })
    }
})

// logout of a session
router.post('/api/logout', auth, async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send({ error: e })
    }
})

// logout all the session
router.post('/api/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send({ error: e })
    }
})

// to follow a user with given id
router.post('/api/follow/:id', auth, async (req, res) => {
    
    if(req.params.id !== req.user._id.toString()){
        try{
            const user = await User.findById(req.params.id)
            if(!user) 
                return res.status(404).send({ error: { message: "User not found" } })
            const currentUser = req.user
            if(!user.followers.includes(currentUser._id)){
                await user.updateOne({ $push: { followers: currentUser._id } })
                await currentUser.updateOne({ $push: { followings: req.params.id } })
                res.status(200).send("You are following the user!")
            } else {
                res.status(403).send({ error: { message: "You already follow this user" } })
            }
        } catch(e) {
            res.status(401).send({ error: e })
        }
    } else {
        res.status(403).send({ error: { message: "You cannot follow yourself" } })
    }
})

// to unfollow a user with given id
router.post('/api/unfollow/:id', auth, async (req, res) => {
    
    if(req.params.id !== req.user._id.toString()){
        try{
            const user = await User.findById(req.params.id)
            const currentUser = req.user
            if(user.followers.includes(currentUser._id)){
                await user.updateOne({ $pull: { followers: currentUser._id } })
                await currentUser.updateOne({ $pull: { followings: req.params.id } })
                res.status(200).send("You unfollwed the user")
            } else {
                res.status(403).send({ error: { message:"You do not follow this user" } })
            }
        } catch(e) {
            res.status(401).send({ error: e })
        }
    } else {
        res.status(403).send({ error: { message:"You cannot unfollow" } })
    }
})

// to fetch the authenticated user details
router.get('/api/user', auth, async (req,res) => {
    res.send({
        userName: req.user.userName,
        followers: req.user.followers.length,
        following: req.user.followings.length
    })
})

module.exports = router