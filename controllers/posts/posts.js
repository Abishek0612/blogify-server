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
        image: req?.file?.path,
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
//@access Private

exports.getPosts = asyncHandler(async (req, res) => {
    //! find all users who have blocked the logged in user
    const loggedInUserId = req.userAuth?._id;
    //get current time
    const currentTime = new Date();

    const usersBlockingLoggedInUser = await User.find({
        blockedUsers: loggedInUserId
    })
    //Extract the IDs of users who have blocked the logged in user
    const blockingUsersIds = usersBlockingLoggedInUser?.map((user) => user?._id)

    //query
    const query = {
        author: { $nin: blockingUsersIds },
        $or: [{
            schedduledPublish: { $lte: currentTime },
            schedduledPublish: null,
        }]
    }

    const posts = await Post.find(query) //.populate('comments')
    res.status(201).json({
        status: 'success',
        message: 'Posts successfully fetched',
        posts
    })
})


//@desc Get only 4 POST
//@route GET/api/v1/posts
//@access Public

exports.getPublicPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(4)
    res.status(201).json({
        status: "success",
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



//@desc Liking a  POST
//@route PUT/api/v1/posts/likes/:id
//@access Private

exports.likePost = asyncHandler(async (req, res) => {
    //Get the id of the post
    const { id } = req.params
    //get the login user
    const userId = req.userAuth._id;
    //Find the post
    const post = await Post.findById(id);
    if (!post) {
        throw new Error("Post not found")
    }
    //Push the user into post likes
    await Post.findByIdAndUpdate(id, {
        $addToSet: { likes: userId }
    }, {
        new: true
    });
    //Remove the user from the dislikes array if present
    post.dislikes = post.dislikes.filter(
        (dislikes) => dislikes.toString() !== userId.toString())

    //resave the post
    await post.save()
    res.status(200).json({ message: "Post like successfully", post })
})



//@desc DisLikeing a  POST
//@route PUT/api/v1/posts/dislikes/:id
//@access Private

exports.disLikePost = asyncHandler(async (req, res) => {
    //Get the id of the post
    const { id } = req.params
    //get the login user
    const userId = req.userAuth._id;

    //Find the post
    const post = await Post.findById(id);
    if (!post) {
        throw new Error("Post not found")
    }

    //Push the user into post dislikes
    await Post.findByIdAndUpdate(id, {
        $addToSet: { dislikes: userId }
    }, {
        new: true
    })

    //Remove the user from the likes array if present
    post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString())

    //resave the post
    await post.save()

    res.status(200).json({ message: 'Post disliked successfully', post })
})



//@desc clapping a  POST
//@route PUT/api/v1/posts/claps/:id
//@access Private

exports.claps = asyncHandler
    (async (req, res) => {
        //Get the id of the post
        const { id } = req.params;
        //Find the post
        const post = await Post.findById(id);
        if (!post) {
            throw new Error("Post not found");
        }
        //implement the claps
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                $inc: { claps: 1 },
            },
            {
                new: true,
            }
        );
        res.status(200).json({
            message: "Post clapped successfully.", updatedPost
        });
    });




//@desc Schedule  a  POST
//@route PUT/api/v1/posts/schedule/:postId
//@access Private

exports.schedule = asyncHandler(async (req, res) => {
    //get the payload
    const { scheduledPublish } = req.body;
    const { postId } = req.params
    //check if postid and scheduledpublished found
    if (!postId || !scheduledPublish) {
        throw new Error("PostID and schedule date are required")
    }
    //find the post
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error("Post not found")
    }
    //check if the user is the author of the post
    if (post.author.toString() !== req.userAuth._id.toString()) {
        throw new Error("You can schedule your own post")
    }
    //check if the scheduledpublished date is in the past
    const scheduleDate = new Date(this.scheduledPublish);
    const currentDate = new Date()
    if (scheduleDate < currentDate) {
        throw new Error("The scheduled publish date cannot be in the past")
    }

    //update the post
    post.shedduledPublished = scheduledPublish;
    await post.save()
    res.json({
        status: "success",
        message: "Post scheduled successfully",
        post,
    })

})
