const express = require('express')
const Post = require('../models/posts')
const Comment = require('../models/comments')
const router = new express.Router()

const auth = require('../middlewares/auth')

// to create a new post of authenticated user
router.post('/api/posts', auth, async (req,res) => {
    const postData = { ...req.body, createdBy: req.user._id }
    try{
        const post = new Post(postData)
        await post.save()

        const postObject = post.toObject()
        delete postObject.comments
        delete postObject.likes
        delete postObject.createdBy
        delete postObject.updatedAt

        res.send(postObject)

    } catch(e) {
        res.status(400).send({ error: e })
    }
})

// to delete a post of authenticated user
router.delete('/api/posts/:id', auth, async (req,res) => {
    try{
        const post_id = req.params.id
        const post = await Post.findById(post_id)
        if(!post) 
            return res.status(404).send({ error: { message: "Post not found" } })
        if(post.createdBy.toString() === req.user._id.toString()){
            await Post.deleteOne({ _id : post_id })
            res.status(200).send("Post deleted successfully")
        } else {
            return res.status(403).send({ error: { message: "You cannot delete other users post" } })
        }
    } catch(e) {
        res.status(400).send({ error: e })
    }
})

// to like a post of given id
router.post('/api/like/:id', auth, async (req,res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post) 
            return res.status(404).send({ error: { message: "Post not found" } })
        if(!post.likes.includes(req.user._id)){
            await post.updateOne({ $push: { likes: req.user._id } })
            res.status(200).send("You liked this post")
        } else {
            res.status(403).send({ error: { message:"You already liked this post" } })
        }
    } catch(e) {
        res.status(401).send({ error: e })
    }
})

// to unlike a post of given id
router.post('/api/unlike/:id', auth, async (req,res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post) 
            return res.status(404).send({ error: { message: "Post not found" } })
        if(post.likes.includes(req.user._id)){
            await post.updateOne({ $pull: { likes: req.user._id } })
            res.status(200).send("You unliked this post")
        } else {
            res.status(403).send({ error: { message:"Post is already unliked" } })
        }
    } catch(e) {
        res.status(401).send({ error: e })
    }
})

// to comment on the post of given id
router.post('/api/comment/:id', auth, async (req,res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post) 
            return res.status(404).send({ error: { message: "Post not found" } })
        
        const comment = new Comment( { postId: req.params.id, commentedBy: req.user._id, comment: req.body.comment } )
        await comment.save()
        res.status(200).send({ comment_id: comment._id })
    } catch(e) {
        res.status(401).send({ error: e })
    }
})

// returns a signle post details of given id
router.get('/api/posts/:id', async (req,res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post) 
            return res.status(404).send({ error: { message: "Post not found" } })
        await post.populate({
            path:"comments"
        })
        const { title, description, likes } = post.toObject()
        res.send({ title, description, likes:likes.length, comments: post.comments})
    } catch(e) {
        res.status(401).send({ error: e })
    }
    
})

// returns all posts created by authenticated user sorted by post time
router.get('/api/all_posts', auth, async (req,res) => {
    try{
        const posts = await Post.find({ createdBy: req.user._id }).populate({ path:"comments" })
        const postList = []
        for(let i=0;i<posts.length;i++){
            const {title, description, likes, createdAt, _id} = posts[i]
            postList.push({ id:_id, title, desc:description, comments: posts[i].comments, created_at:createdAt, likes: likes.length})
        }
        res.send(postList)
    } catch(e) {
        res.status(401).send({ error: e })
    }
})

module.exports = router

