const route = require('express').Router();
const userController = require('../controllers/userController')
const csrfMiddleware = require('./../middlewares/csrfMiddleware')
const upload = require('./../utils/multer')


route.get('/profile/:userId', userController.getProfile)

route.patch('/update/profile', upload.single('profilePic'), userController.updateProfile)

module.exports = route