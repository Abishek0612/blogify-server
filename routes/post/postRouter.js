const express = require('express');
const isLoggin = require('../../middlewares/isLoggin');
const { createPost, getPosts, getSinlglePost, updatePost, deletePost, likePost, disLikePost } = require('../../controllers/posts/posts');


const postsRouter = express.Router();

//create
postsRouter.post('/', isLoggin, createPost)

//! getting all posts
postsRouter.get('/', getPosts);

//? get single post
postsRouter.get('/:id', getSinlglePost)

//* update post
postsRouter.put('/:id',isLoggin, updatePost)

//? Delete post
postsRouter.delete('/:id', isLoggin, deletePost)

//* like post
postsRouter.put('/likes/:id', isLoggin, likePost)


//* dislike post
postsRouter.put('/dislike/:id', isLoggin, disLikePost)

module.exports = postsRouter