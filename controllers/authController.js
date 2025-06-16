const axios = require('axios')
const fs = require('fs')
const path = require('path')

const User = require('../database/models/user')
const bcrypt = require('../utils/bcrypt')
const joi = require('../utils/joi')
const random = require('../utils/random')
const jwt = require('./../utils/jwt')
const config = require('../config/config')
const mailer = require('../utils/nodemailer')
const downloadImage = require('../utils/download')

/* /auth/signup */ 
const signup = async (req, res) => {
    const fields = joi.userSchema.validate({...req.body, roles: ['user']})
    if(fields.error){
        return res.status(400).json({
            status: 400,
            message: fields.error.details[0].message
        })
    }

    if(await User.isExist({email: fields.value.email})){
        return res.status(400).json({
            status: 400,
            message: 'email has already taken, please use another email'
        })
    }

    try{
        const user = new User(fields.value)
        await user.save()

        const {accessToken, refreshToken} = jwt.generateTokenPair(user)
        await user.update({ refreshToken })

        res.cookie('refreshToken', refreshToken, config.cookieOptions)
        return res.status(201).json({
            status: 201,
            accessToken,
            user: {
                username: user.username,
                picture: user.picture,
                description: user.description,
                id: user.id
            }
        })
    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

/* /auth/signin */ 
const signin = async (req, res) => {
    const {email, password} = req.body

    if(!email || !password) return res.status(400).json({
        status: 400,
        message: 'missing field'
    })
    
    try{
        const user = await User.findOne({ email }).exec()
        if(!user){
            return res.status(401).json({
                status: 401,
                message: 'unmatch credentials'
            })
        }

        const isTruePassword = bcrypt.check(password, user.password)
        if(!isTruePassword){
            return res.status(401).json({
                status: 401,
                message: 'unmatch credentials'
            })
        }

        const {accessToken, refreshToken} = jwt.generateTokenPair(user)
        await user.update({ refreshToken })

        res.cookie('refreshToken', refreshToken, config.cookieOptions)
        return res.status(200).json({
            status: 200,
            accessToken,
            user: {
                username: user.username,
                picture: user.picture,
                description: user.description,
                id: user.id
            }
        })
    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

/* /auth/forgotpassword */ 
const forgotPassword = async (req, res) => {
    const {email} = req.body;

    try{
        const user = await User.findOne({email}).exec()
        if(!user) return res.status(401).json({
            status: 401,
            message: 'email not found'
        })

        const {original, hashed} = random.originalAndHashed()
        user.update({
            hashedResetPasswordToken: hashed,
            resetPasswordTokenExpiresAt: Date.now() + 1000 * 60 * 5,
            isUsedResetPasswordToken: false
        })

        // send mail
        const link = process.env.FE_ORIGIN + '/auth/resetpassword?' + new URLSearchParams({
            code: original,
            email: email
        }).toString()

        await mailer.send({
            receiver: email,
            subject: 'Change Password Request',
            html: fs.readFileSync(path.join(__dirname, '..', 'views', 'forgotPassword.html'), 'utf-8').replace('[link]', link),
            attachments:[
                {
                    filename: 'erticleLogo.png',
                    path: path.join(__dirname, '..', 'assets', 'erticleLogo.png'),
                    cid: 'logo@erticle'
                }
            ]
        })

        return res.status(200).json({
            status: 200,
            message: 'email sent, please check your email',
        })

    }catch(err){
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

/* /auth/resetpassword */ 
const resetPassword = async (req, res) => {
    const { email, newPassword, resetPasswordToken } = req.body
    const pwdField = joi.updateUserSchema.validate({newPassword})
    if(pwdField.error) return res.status(400).json({
        status: 400,
        message: pwdField.error.details[0].message
    })
    
    try{
        const user = await User.findOne({email});
        if(!user) return res.status(403).json({
            status: 403,
            message: 'email not found'
        })

        const checkToken = random.compare(resetPasswordToken, user.hashedResetPasswordToken)
        if(!checkToken) return res.status(400).json({
            status: 403,
            message: 'token invalid'
        })

        const isExpired = user.resetPasswordTokenExpiresAt?.getTime() < Date.now()
        if(isExpired || !user.resetPasswordTokenExpiresAt) return res.status(400).json({
            status: 403,
            message: 'token expired'
        })

        const {accessToken, refreshToken} = jwt.generateTokenPair(user)

        await user.update({
            password: bcrypt.hash(pwdField.value.newPassword),
            refreshToken,
            resetPasswordTokenExpiresAt: null,
            hashedResetPasswordToken: null
        })
        
        res.cookie('refreshToken', refreshToken, config.cookieOptions)
        return res.status(200).json({
            status: 200,
            accessToken,
            user: {
                username: user.username,
                picture: user.picture,
                description: user.description,
                id: user.id
            }
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    }
}

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"; //to send consent screen and get code
const TOKEN_URL = "https://oauth2.googleapis.com/token"; //to get access_token
const USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"; // to verify access_token and get user info

function googleSignup(req, res){
    const options = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        scope:[
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ].join(" "),
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
    }
    const query =  new URLSearchParams(options)
    const url = `${AUTH_URL}?${query.toString()}`
    
    return res.status(200).json({
        status: 200,
        url
    })
}

async function googleSignupRedirect(req, res){
    const {code} = req.query
    try{
        const formURLEncoded = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            code,
            grant_type: "authorization_code"
        })

        const {data: {access_token}} = await axios.post(TOKEN_URL, formURLEncoded, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        const {data} = await axios.get(USER_INFO_URL, {
            headers:{
                "Authorization": `Bearer ${access_token}`
            }
        })
        
        const user = await User.findOne({email: data.email}).exec()
        if(!user){
            const user = new User({
                username: data.name,
                email: data.email,
                roles: ['user'],
                picture: await downloadImage(data.picture)
            })
            await user.save()
            const {accessToken, refreshToken} = jwt.generateTokenPair(user)
            await user.update({
                refreshToken
            })
            res.cookie('refreshToken', refreshToken, config.cookieOptions)
        }else{
            const {accessToken, refreshToken} = jwt.generateTokenPair(user)
            await user.update({
                refreshToken
            })
            res.cookie('refreshToken', refreshToken, config.cookieOptions)
        }
        return res.redirect(`${process.env.FE_ORIGIN}/auth/redirect`)

    }catch(err){
        console.log(err)
       return res.status(500).json({
            status: 500,
            message: err.message
        })
    }   
}

function signout(req, res){
    res.clearCookie('refreshToken', config.cookieOptions)
    req.session.destroy()

    return res.status(200).json({
        status: 200,
        message: 'logged out'
    })
}

/* /auth/authenticate */
const authenticate = (req, res) => {
    console.log(req.sessionID)
    return res.send(req.sessionID)
}

/* /auth/authorize */
const authorize = (req, res) => {
    
}

const refresh = async (req, res) => {
    const oldRefreshToken = req.cookies?.refreshToken
    if(!oldRefreshToken) return res.status(401).json({
        status: 403,
        message: 'no refresh token'
    })

    const isVerified = jwt.verify(oldRefreshToken)
    if(!isVerified.verified) return res.status(403).json({
        status:403,
        message: isVerified.message
    })

    const user = await User.findById(isVerified.decoded.userId).exec()
    if(!user) return res.status(403).json({
        status: 403,
        message: 'refresh token no longer exist'
    })

    const {accessToken, refreshToken} = jwt.generateTokenPair(user)
    await user.update({ refreshToken })

    res.cookie('refreshToken', refreshToken, config.cookieOptions)
    return res.status(200).json({
        status: 200,
        accessToken,
        user: {
            username: user.username,
            email: user.email,
            picture: user.picture,
            description: user.description,
            id: user.id
        }
    })
}

module.exports = {
    signup,
    signin,
    forgotPassword,
    resetPassword,
    googleSignup,
    googleSignupRedirect,
    signout,
    authenticate,
    authorize,
    refresh
}