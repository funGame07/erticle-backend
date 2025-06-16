const route = require('express').Router();
const userController = require('../controllers/userController')
const csrfMiddleware = require('./../middlewares/csrfMiddleware')
const authController = require('./../controllers/authController')
const csrf = require('./../utils/csrf')
const upload = require('./../utils/multer')

route.get('/csrf', (req, res) => {
    const csrfToken = csrf.generate()
    req.session.csrfToken = csrfToken
    res.status(200).json({
        status: 200,
        csrfToken
    })
})

// route.post('/authenticate', authController.authenticate)
// route.post('/authorize', authController.authorize)
route.get('/refresh', authController.refresh)

route.get('/google', authController.googleSignup)
route.get('/google/redirect', authController.googleSignupRedirect)
route.get('/signout', authController.signout)

route.use(csrfMiddleware)
route.post('/signup', authController.signup)
route.post('/signin', authController.signin)
route.post('/forgotpassword', authController.forgotPassword)
route.post('/resetpassword', authController.resetPassword)

module.exports = route