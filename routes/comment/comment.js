const express = require('express')
const isLoggin = require('../../middlewares/isLoggin')
const { createComment, updateComment, deleteComment } = require('../../controllers/comments/comments')


const commentRouter = express.Router()

//Create a comment
commentRouter.post('/:postId',isLoggin, createComment)

//? Update comment
commentRouter.put('/:id',isLoggin, updateComment)

//! delete coment
commentRouter.delete('/:id',isLoggin, deleteComment)


module.exports = commentRouter