const crypto = require('crypto')
const fs = require('fs')
const path = require('path')


const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
    }
})

// fs.writeFileSync(path.join(__dirname, 'accessPublicKey.key'), publicKey.toString())
// fs.writeFileSync(path.join(__dirname, 'accessPrivateKey.key'), privateKey.toString())

