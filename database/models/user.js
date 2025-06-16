const mongoose = require('mongoose')
const bcrypt = require('./../../utils/bcrypt')
const Article = require('./article')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    password: {
        type: String,
    },
    picture: {
        type: String
    },
    roles: {
        type: Array,
        required: true
    },
    description:{
        type: String
    },
    bookmarks: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
    ],
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
    ],
    hashedResetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpiresAt: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String
    },
})

UserSchema.pre('save', function(next){
    if(this.password){
        this.password = bcrypt.hash(this.password)
    }
    
    next()
})

UserSchema.methods.update = async function(fields){
    await User.findByIdAndUpdate(this.id, { $set: fields }).exec()
}
UserSchema.methods.push = async function(fields){
    await User.findByIdAndUpdate(this.id, { $push: fields }).exec()
}

UserSchema.methods.articles = async function(){
    if(mongoose.Types.ObjectId.isValid(this.id)){
        const articles = await Article.find({author: this.id}).populate('author').sort({'createdAt' : -1}).exec()
        return articles
    }else{
        new Error('user not found')
    }
    
}

UserSchema.statics.isExist = async function(fields){
    const user = await User.findOne(fields).exec()
    if(user) return true
    return false
}

const User = mongoose.model('User', UserSchema)

module.exports = User