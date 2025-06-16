const jsonwebtoken = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const publicKey = fs.readFileSync(path.join(__dirname, 'jwtSecret', 'publicKey.key'), 'utf-8')
const privateKey = fs.readFileSync(path.join(__dirname, 'jwtSecret', 'privateKey.key'), 'utf-8')

const jwt = {
    makePayload: (userModel) =>{
        return {
            userId: userModel.id,
            // picture: userModel.picture
            roles: userModel.roles ?? []
        }
    },


    sign: (payload, options) => {
        const defaulOptions = {
            expiresIn: '2h',
            algorithm: 'RS256'
        }

        const jwtOptions = Object.assign(defaulOptions, options)

        return jsonwebtoken.sign(payload, privateKey, jwtOptions)
    },

    /**
     * if error return the verified: false and message
     * 
     * if success return the verified: true and decoded
     * @param {String} token
     */
    verify: (token) =>{
        return jsonwebtoken.verify(token, publicKey, {algorithms: ['RS256']}, function(err, decoded){
            if(err) return {
                verified: false,
                message: err.message
            }
                
            return {
                verified: true,
                decoded
            }
        })
    },

    generateTokenPair: (user) =>{
        const payload = jwt.makePayload(user)
        return {
            accessToken: jwt.sign(payload),
            refreshToken: jwt.sign(payload, {expiresIn: '30d'}),
        }
    }

}

module.exports = jwt