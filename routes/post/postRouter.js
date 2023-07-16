const express = require('express');
const isLoggin = require('../../middlewares/isLoggin');
const { createPost, getPosts, getSinlglePost, updatePost, deletePost, likePost, disLikePost, claps, schedule } = require('../../controllers/posts/posts');
const storage = require('../../utils/fileUpload');
const multer = require('multer')

const postsRouter = express.Router();

//!file upload middleware
const upload = multer({ storage })

//create
postsRouter.post('/', isLoggin, upload.single("file"), createPost)

//! getting all posts
postsRouter.get('/', isLoggin, getPosts);

//! getting single posts
postsRouter.get('/', getSinlglePost);

//? get single post
postsRouter.get('/:id', isLoggin, getSinlglePost)

//* update post
postsRouter.put('/:id', isLoggin, updatePost)

//? Delete post
postsRouter.delete('/:id', isLoggin, deletePost)

//* like post
postsRouter.put('/likes/:id', isLoggin, likePost)


//* dislike post
postsRouter.put('/dislike/:id', isLoggin, disLikePost)

//Clapping a post
postsRouter.put('/claps/:id', isLoggin, claps)

//schedule a post
postsRouter.put('/schedule/:postId', isLoggin, schedule)

module.exports = postsRouter