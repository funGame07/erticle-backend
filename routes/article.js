const route = require('express').Router();
const articleController = require('../controllers/ArticleController')
const csrfMiddleware = require('../middlewares/csrfMiddleware')
const upload = require('./../utils/multer')

route.post('/upload/image', upload.single('uploadImage'), (req, res) =>{
    return res.status(201).json({
        status: 201,
        imagePath: req.file.path
    })
})

route.post('/post', upload.single('thumbnail') , articleController.post)
route.get('/get' , articleController.get)
route.get('/get/limit/:limit', articleController.getLimit)
route.get('/get/bookmark/:userId' , articleController.getBookmark)
route.get('/get/:articleId/:readerId' , articleController.getById)
route.patch('/update/bookmark/:articleId' , articleController.totalBookmarks)
route.patch('/update/like/:articleId' , articleController.totalLikes)
route.delete('/delete/:articleId' , articleController.deleteArticle)

module.exports = route