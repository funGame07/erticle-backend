const mongoose = require('mongoose')
const User = require('./user')

const ArticleSchema = new mongoose.Schema({
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalBookmarks: {
        type: Number,
    },
    totalLikes: {
        type: Number
    },
    title: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: null
    },
    content: {
        type: String,
        required: true
    },
    overview: {
        type: String
    }

},{
    timestamps: true
})

const Article = mongoose.model('Article', ArticleSchema)

module.exports = Article