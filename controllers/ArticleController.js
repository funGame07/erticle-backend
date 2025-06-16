const { default: mongoose } = require('mongoose')
const User = require('../database/models/user')
const Article = require('./../database/models/article')


const post = async (req, res) =>{
    const {title, authorId, overview, content} = req.body

    try{
        const article = new Article({
            title,
            thumbnail: req.file?.path,
            content,
            overview,
            author: authorId,
            totalBookmarks: 0,
            totalLikes: 0
        })

        await article.save()

        return res.status(201).json({
            status: 201,
            article
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

const get = async(req, res) =>{
    try{
        const articles = await Article.find({}).populate({
            path: 'author',
            select: 'username picture roles'
        }).sort({ 'createdAt' : -1 }).lean()

        return res.status(200).json({
            status: 200,
            articles
        })
    }catch(err){
        return res.status(504).json({
            status:504,
            err,
        })
    }
}

const getById = async (req, res) =>{
    const {articleId, readerId} = req.params

    try{
        if(!mongoose.Types.ObjectId.isValid(articleId)) return res.json({
            status: 403,
            message: 'invalid article id'
        })

        const article = await Article.findById(articleId).populate('author').lean()
        if(!article) return res.status(404).json({
            status: 404,
            messsage: 'article not found'
        })

        let isBookmarked = false
        let isLiked = false
        if(readerId && mongoose.Types.ObjectId.isValid(readerId)){
            const user = await User.findById(readerId).select('bookmarks').populate({
                path: 'bookmarks likes',
                select: 'id'
            }).lean()

            const isReaderBookmarked = user.bookmarks?.find((el) => el._id.toString() === articleId)
            const isReaderLiked = user.likes?.find((el) => el._id.toString() === articleId)
            if(isReaderBookmarked) isBookmarked = true
            if(isReaderLiked) isLiked = true
        }
        
        return res.status(200).json({
            status: 200,
            article,
            isBookmarked,
            isLiked,
        })
    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

const getBookmark = async (req, res) =>{
    const {userId} = req.params

    try{
        if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(403).json({
            status: 403,
            message: 'invalid user id'
        })
        const {bookmarks} = await User.findById(userId).populate({
            path: 'bookmarks',
            populate:{
                path: 'author',
                select: 'picture username'
            }
        }).lean()

        return res.status(200).json({
            status:200,
            bookmarks: bookmarks
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

const totalLikes = async (req, res) =>{
    const {readerId} = req.body
    const {articleId} = req.params

    try{
        if(!mongoose.Types.ObjectId.isValid(articleId)) return res.status(403).json({
            status: 403,
            message: 'invalid article id'
        })
        if(!mongoose.Types.ObjectId.isValid(readerId)) return res.status(403).json({
            status: 403,
            message: 'invalid user id'
        })

        const reader = await User.findById(readerId).populate('likes').lean()
        if(!reader) return res.status(404).json({
            status: 404,
            message: 'user not found'
        })
        const article = await Article.findById(articleId).lean()
        if(!article) return res.status(404).json({
            status: 404,
            message: 'article not found'
        })
        const alreadyLiked = reader.likes?.find((el) => el._id.toString() === articleId)
        
        if(alreadyLiked){
            await User.findByIdAndUpdate(readerId, { $pull: {likes: articleId}})
            await Article.findByIdAndUpdate(articleId, { $inc: {totalLikes: -1}})
        }else{
            await User.findByIdAndUpdate(readerId, { $push: {likes: articleId}})
            await Article.findByIdAndUpdate(articleId, { $inc: {totalLikes: 1}})
        }

        return res.status(200).json({
            status: 200,
            alreadyLiked: Boolean(alreadyLiked),
        })


    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

const totalBookmarks = async (req, res) =>{
    const {readerId} = req.body
    const {articleId} = req.params

    try{
        if(!mongoose.Types.ObjectId.isValid(articleId)) return res.status(403).json({
            status: 403,
            message: 'invalid article id'
        })
        if(!mongoose.Types.ObjectId.isValid(readerId)) return res.status(403).json({
            status: 403,
            message: 'invalid user id'
        })

        const reader = await User.findById(readerId).populate('bookmarks').lean()
        if(!reader) return res.status(404).json({
            status: 404,
            message: 'user not found'
        })
        const article = await Article.findById(articleId).lean()
        if(!article) return res.status(404).json({
            status: 404,
            message: 'article not found'
        })
        const alreadyBookmarked = reader.bookmarks?.find((el) => el._id.toString() === articleId)
        
        if(alreadyBookmarked){
            await User.findByIdAndUpdate(readerId, { $pull: {bookmarks: articleId}})
            await Article.findByIdAndUpdate(articleId, { $inc: {totalBookmarks: -1}})
        }else{
            await User.findByIdAndUpdate(readerId, { $push: {bookmarks: articleId}})
            await Article.findByIdAndUpdate(articleId, { $inc: {totalBookmarks: 1}})
        }

        return res.status(200).json({
            status: 200,
            alreadyBookmarked: Boolean(alreadyBookmarked),
        })


    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

const deleteArticle = async (req, res) =>{
    const {articleId} = req.params

    try{
        if(!mongoose.Types.ObjectId.isValid(articleId)) return res.status(404).json({
            status: 404,
            message: 'article not found'
        })

        await Article.findByIdAndDelete(articleId)
        
        await User.updateMany({ bookmarks: articleId }, {
            $pull: {bookmarks: articleId}
        }) 

        return res.status(200).json({
            status: 200,
            deleted: true
        })
    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}


module.exports = {
    post,
    get,
    getById,
    deleteArticle,
    getBookmark,
    totalBookmarks,
    totalLikes,
}