const csrf = require('./../utils/csrf')

const csrfMiddleware = (req, res, next) =>{
    // get csrf from http header
    const token = req.headers['x-csrf-token']

    if(!token || token !== req.session.csrfToken){
        return res.status(403).json({
            status: 403,
            message: 'Missing or unmatch csrf token'
        })
    }

    next()
}

module.exports = csrfMiddleware