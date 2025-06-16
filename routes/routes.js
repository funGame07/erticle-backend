const route = require('express').Router();


route.get('/get', (req, res) =>{
    req.session.user = 1
    res.send(req.sessionID)
})

route.get('/display', (req, res) =>{
    res.cookie('a', 'b')
    // res.send(req.session)
})

route.use('/auth', require('./auth'))
route.use('/user', require('./user'))
route.use('/article', require('./article'))

route.use('/', (req, res) =>{
    res.status(404).json({
        status: 404,
        message: 'not found'
    })
})

module.exports = route