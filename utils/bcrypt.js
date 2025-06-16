const bcryptLib = require('bcrypt')

const bcrypt = {
    hash: (password) =>{
        const salt = bcryptLib.genSaltSync(10)
        return bcryptLib.hashSync(password, salt)
    },

    check: (password, hashedPassword) =>{
        return bcryptLib.compareSync(password, hashedPassword)
    } 
}

module.exports = bcrypt