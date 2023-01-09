const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    postId:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    commentedBy:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    comment:{
        type: String,
        required: true,
        minLength: 1,
        maxLength: 5000,
        trim: true,
    }
})

module.exports = new mongoose.model('Comments', commentSchema)