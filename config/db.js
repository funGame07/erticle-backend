const mongoose = require('mongoose')

async function db(){
    await mongoose.connect(
        process.env.DB_URI
    )
}

module.exports = db