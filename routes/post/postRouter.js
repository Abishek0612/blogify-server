const express = require('express');
const isLoggin = require('../../middlewares/isLoggin');
const { createPost, getPosts, getSinglePost, updatePost, deletePost, likePost, disLikePost, claps, schedule, getPublicPosts, postViewCount } = require('../../controllers/posts/posts');
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
// postsRouter.get('/', getSinglePost);

//? get single post
postsRouter.get('/:id', getSinglePost)

//* update post
postsRouter.put('/:id', isLoggin,upload.single("file"), updatePost)

//? Delete post
postsRouter.delete('/:id', isLoggin, deletePost)

//* like post
postsRouter.put('/likes/:id', isLoggin, likePost)


//* dislike post
postsRouter.put('/dislike/:id', isLoggin, disLikePost)

//* post views
postsRouter.put('/:id/post-view-count', isLoggin, postViewCount)

//Clapping a post
postsRouter.put('/claps/:id', isLoggin, claps)

//schedule a post
postsRouter.put('/schedule/:postId', isLoggin, schedule)

module.exports = postsRouter