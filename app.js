const express = require('express')
const dotenv = require('dotenv')
const session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')

dotenv.config();

const routes = require('./routes/routes')
const config = require('./config/config')
const db = require('./config/db')

const app = express()

app.use(cors(config.cors))
app.use(session(config.session))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', routes)

app.listen(process.env.PORT, async()=>{
    await db()

    console.log('connected to db')
    console.log('running on ' + process.env.PORT);
})