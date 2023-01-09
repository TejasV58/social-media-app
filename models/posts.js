const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    createdBy:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    title:{
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
        trim: true,
    },
    description:{
        type: String,
        required: true,
        minLength: 3,
        maxLength: 5000,
        trim: true,
    },
    likes:{
        type:Array,
        default:[]
    }
},{
    timestamps: true
})

postSchema.virtual('comments', {
    ref: 'Comments',
    localField: '_id',
    foreignField: 'postId'
})

module.exports = new mongoose.model('Posts', postSchema)