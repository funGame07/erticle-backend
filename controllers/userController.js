const User = require('../database/models/user')
const { default: mongoose } = require('mongoose')

async function getProfile(req, res){
    const {userId} = req.params
    
    try{
        if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(403).json({
            status: 403,
            message: 'invalid user id'
        })
        
        const user = await User.findById(userId).select('picture username email description').exec()
        if(!user) return res.status(404).json({
            status:404,
            message: 'user not found'
        })

        const articles = await user.articles()

        return res.status(200).json({
            status: 200,
            profile: user,
            articles
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            status: 500,
            message: 'server error'
        })
    }
}

async function updateProfile(req, res) {
    const {description, userId} = req.body
    const picture = req.file?.path

    try{
        const user = await User.findById(userId).exec()
        if(!user) return res.status(404).json({
            status: 404,
            message: 'user not found'
        })

        await user.update({
            picture: picture || user.picture,
            description
        })

        return res.status(204).end()
    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }

}


module.exports = {
    getProfile,
    updateProfile
}