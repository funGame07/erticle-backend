const crypto = require('crypto')

const random = {
    random: () => crypto.randomBytes(32),

    hmac: () => crypto.createHmac('SHA256', 'secret'),

    hash: function(str){
        return this.hmac().update(str).digest('hex')
    },

    originalAndHashed: function(){
        const randomStr = this.random().toString('hex')
        return {
            original: randomStr,
            hashed: this.hmac().update(randomStr).digest('hex'),
        }
    },

    compare: function(original, hashed){
        return this.hmac().update(original).digest('hex') === hashed
    }
}

module.exports = random