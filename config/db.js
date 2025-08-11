const mongoose = require('mongoose')

async function db(){
    await mongoose.connect(
        // 'mongodb+srv://elbert:passwords@cluster0.x56s9nj.mongodb.net/erticle?retryWrites=true&w=majority&appName=Cluster0'
        process.env.DB_URI
    )
}

module.exports = db
