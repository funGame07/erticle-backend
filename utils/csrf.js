const { v4: uuidv4 } = require('uuid')

const csrf = {
    generate: function (req){
        const token = uuidv4()
        return token
    },
}

module.exports = csrf