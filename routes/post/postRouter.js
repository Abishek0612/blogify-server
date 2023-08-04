const express = require('express');
const isLoggin = require('../../middlewares/isLoggin');
const { createPost, getPosts, getSinlglePost, updatePost, deletePost, likePost, disLikePost, claps, schedule, getPublicPosts } = require('../../controllers/posts/posts');
const storage = require('../../utils/fileUpload');
const multer = require('multer');
const checkAccountVerification = require('../../middlewares/isAccountVerified');

const postsRouter = express.Router();

//!file upload middleware
const upload = multer({ storage })

//create
postsRouter.post('/', isLoggin, checkAccountVerification, upload.single("file"), createPost)


//? get public posts (only 4 post)
postsRouter.get('/public', getPublicPosts)

//! getting all posts
postsRouter.get('/', isLoggin, getPosts);

// //! getting single posts
// postsRouter.get('/', getSinlglePost);

//? get single post
postsRouter.get('/:id', getSinlglePost)

//* update post
postsRouter.put('/:id', isLoggin,upload.single("file"), updatePost)

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