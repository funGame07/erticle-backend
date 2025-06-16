const nodemailer = require('nodemailer')
const fs = require('fs')

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: process.env.ENVIROMENT === 'production' ? 465 : 587,
    secure: process.env.ENVIROMENT === 'production',
    auth:{
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS
    }
})

const mailer = {
    send: async function({receiver, subject, html, attachments}){

        transport.sendMail({
            from: {
                address: process.env.NODEMAILER_EMAIL,
                name: 'Erticle'
            },
            subject: subject,
            to: receiver,
            html,
            attachments
        })
    }
}

module.exports = mailer