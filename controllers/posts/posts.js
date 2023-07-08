const asyncHandler = require('express-async-handler')
const Post = require('../../model/Post/Post')
const User = require('../../model/User/User')
const Category = require('../../model/Category/Category')


//@desc Create a Posts
//@route POST /api/v1/posts
//@access Private

exports.createPost = asyncHandler(async (req, res) => {
    //Get the payload
    const { title, content, categoryId } = req.body;

    //check if post exists
    const postFound = await Post.findOne({ title })
    if (postFound) {
        throw new Error('Post already exists')
    }
    //create posts
    const createPosts = await Post.create({
        title,
        content,
        category: categoryId,
        author: req.userAuth._id,
    })
    //! Associate post to user
    await User.findByIdAndUpdate(req?.userAuth?._id, {
        $push: { posts: createPosts._id }
    }, {
        new: true,
    })
    //* Push post into category
    await Category.findByIdAndUpdate(
        req?.userAuth?._id,
        {
            $push: { posts: createPosts._id }
        }, {
        new: true
    }
    )

    //? send the response
    res.json({
        status: 'success',
        message: 'Post created successfully',
        createPosts
    })
})


//@desc Get all posts
//@route GET/api/v1/posts
//@access Public

exports.getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({}) //.populate('comments')
    res.status(201).json({
        status: 'success',
        message: 'Posts successfully fetched',
        posts
    })
})



//@desc Get single POST
//@route GET/api/v1/posts/:id
//@access Public

exports.getSinlglePost = asyncHandler(async (req, res) => {
    const singlePost = await Post.findById(req.params.id)

    res.status(201).json({
        status: 'success',
        message: 'Post successfully fetched',
        singlePost
    })
})


//@desc Delete  POST
//@route DELETE/api/v1/posts/:id
//@access Private

exports.deletePost = asyncHandler(async (req, res) => {
    await Post.findByIdAndDelete(req.params.id)
    res.status(201).json({
        status: 'success',
        message: 'Post deleted successfully'
    })
})


//@desc Update  POST
//@route PUT/api/v1/posts/:id
//@access Private

exports.updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        });
    res.status(201).json({
        status: 'success',
        message: 'post successfully updated',
        post
    })
})