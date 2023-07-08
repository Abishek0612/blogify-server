const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require("../../model/User/User");
const generateToken = require('../../utils/generateToken');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');
const sendAccVerificationEmail = require('../../utils/sendAccVerificationEmail');

//@desc Register a new user
//@route POST /api/v1/users/register
//@access public
exports.register = asyncHandler(async (req, res) => {

    //get the details
    const { username, email, password } = req.body;
    //!check if user exists
    const user = await User.findOne({ username })
    if (user) {
        throw new Error('User Already Exists')
    }
    //Register a new user
    const newUser = new User({
        username,
        email,
        password
    });
    //! hash password
    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(password, salt)
    //save
    await newUser.save()
    res.status(201).json({
        status: 'success',
        message: 'User Registered Successfully',
        _id: newUser?._id,
        username: newUser?.username,
        email: newUser?.email,
        role: newUser?.role
    })
}
)


//@desc Login  user
//@route POST /api/v1/users/login
//@access public

exports.login = asyncHandler(async (req, res) => {

    //? get the login details
    const { username, password } = req.body
    //! check if exists
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Invalid login credentials')
    }
    //compare the hashed password with the one the request
    const isMatched = await bcrypt.compare(password, user?.password)
    if (!isMatched) {
        throw new Error('Invalid login credentials')
    }
    //Update the last login
    user.lastLogin = new Date()
    await user.save()
    res.json({
        status: 'success',
        email: user?.email,
        username: user?.username,
        _id: user?._id,
        role: user?.role,
        token: generateToken(user)
        // message:'Login successfull'
    })
}
)


//@desc Get profile
//@route POST /api/v1/users/profile/:id
//@access private

exports.getProfile = asyncHandler(async (req, res, next) => {

    //! get user id from params
    const id = req.userAuth._id
    const user = await User.findById(id)
    console.log(user)
    res.json({
        status: 'success',
        message: 'Profile fetched',
        user
    })
}
)


//@desc Block a  user
//@route PUT /api/v1/users/block/:userIdToBlock
//@access Private

exports.blockUser = asyncHandler(async (req, res) => {
    //*Find the user to block
    const userIdToBlock = req.params.userIdToBlock
    const userToBlock = await User.findById(userIdToBlock);
    if (!userToBlock) {
        throw new Error('User to block not found')
    }
    //!user who is blocking
    const userBlocking = req.userAuth._id

    // check if user is blocking him/herself
    if (userIdToBlock.toString() === userBlocking.toString()) {
        throw new Error('Cannot block yourself')
    }

    //find the current user
    const currentUser = await User.findById(userBlocking);

    //? check if user already blocked
    if (currentUser?.blockedUsers?.includes(userIdToBlock)) {
        throw new Error('User already blocked')
    }
    //push the user to be blocked in the array of the current user
    currentUser?.blockedUsers.push(userIdToBlock);
    await currentUser.save()
    res.json({
        message: 'User blocked successfully',
        status: 'success'
    })
})



//@desc UNBlock a  user
//@route PUT /api/v1/users/unblock/:userIdTounBlock
//@access Private

exports.unblockUser = asyncHandler(async (req, res) => {
    //! Find the user to be unblocked
    const userIdToUnBlock = req.params.userIdToUnBlock;
    const userToUnBlock = await User.findById(userIdToUnBlock)
    if (!userToUnBlock) {
        throw new Error("User to be unblock not found")
    }
    //?Find the current user
    const userUnBlocking = req.userAuth._id;
    const currentUser = await User.findById(userUnBlocking);

    //Check if user is blocked before unblocking
    if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
        throw new Error('User not blocked')
    }
    //remove the user  from the current user blocked users array
    currentUser.blockedUsers = currentUser.blockedUsers.filter((id) =>
        id.toString() !== userIdToUnBlock.toString())
    //resave the current user
    await currentUser.save()
    res.json({
        status: 'success',
        message: 'User unblocked successfully'
    })
})



//@desc  Who view my profile  
//@route GET /api/v1/users/profile-viewer/:userProfileId
//@access Private

exports.profileViewers = asyncHandler(async (req, res) => {
    //! Find that we want to view his profile
    const userProfileId = req.params.userProfileId

    const userProfile = await User.findById(userProfileId)
    if (!userProfile) {
        throw new Error('User to view his profile not found')
    }

    //find the current user
    const currentUserId = req.userAuth._id;

    //? check user already viewed the profile
    if (userProfile?.profileViewers?.includes(currentUserId)) {
        throw new Error('You have already viewed this profile')
    }

    //Push the user current user id into the user profile
    userProfile.profileViewers.push(currentUserId);
    await userProfile.save();
    res.json({
        message: 'You have successfully viewed his/her profile',
        status: 'success'
    })
})



//@desc  Following user  
//@route PUT /api/v1/users/following/:userIdToFollow
//@access Private

exports.followingUser = asyncHandler(async (req, res) => {
    //Find the current user
    const currentUserId = req.userAuth._id
    //! Find the user to follow
    const userToFollowId = req.params.userToFollowId
    //Avoid user following himself
    if (currentUserId.toString() === userToFollowId.toString()) {
        throw new Error("You cannot follow yourself")
    }

    //push the usertofollowId into the current user following field
    await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: userToFollowId }
    }, {
        new: true,
    })

    //push the currentUserId into the  user followers field
    await User.findByIdAndUpdate(userToFollowId, {
        $addToSet: { followers: currentUserId }
    }, {
        new: true
    })

    //send the response
    res.json({
        status: 'success',
        message: 'You have followed the user successfully'
    })
})


//@desc  UnFollowing user  
//@route PUT /api/v1/users/unfollowing/:userIdToUnFollow
//@access Private

exports.UnFollowingUser = asyncHandler(async (req, res) => {
    //Find the current user 
    const currentUserId = req.userAuth._id;
    //! Find the user to unfollow
    const userToUnFollowId = req.params.userToUnFollowId

    //Avoid user to unfollowing himself
    if (currentUserId.toString() === userToUnFollowId.toString()) {
        throw new Error('You cannot unfollow yourself');
    }

    //?Remove the usertoUnfollowID from the current user following field
    await User.findByIdAndUpdate(
        currentUserId, {
        $pull: { following: userToUnFollowId }
    }, {
        new: true,
    }
    );

    //Remove the currentUserId from the user to unfollow followers field
    await User.findByIdAndUpdate(
        userToUnFollowId, {
        $pull: { followers: currentUserId }
    }, {
        new: true
    }
    );
    res.json({
        status: 'success',
        message: 'You have unfollowed user successfully'
    })
})



//@desc  Forgot passsword   
//@route POST /api/v1/users/forgot-password
//@access Public

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    //Find the email in our db
    const userFound = await User.findOne({ email });
    if (!userFound) {
        throw new Error("There's No Email In Our System")
    }
    //create token
    const resetToken = await userFound.generatePasswordResetToken();
    //resave the user
    await userFound.save()

    //send email
    sendEmail(email, resetToken)

    res.status(200).json({
        message: "Password reset email sent", resetToken
    })
})

//@desc  Reset passsword   
//@route POST /api/v1/users/reset-password/:resetToken
//@access Public

exports.resetPassword = asyncHandler(async (req, res) => {
    //Get the id/token from email/params
    const { resetToken } = req.params
    const { password } = req.body
    //Convert the token to actual token that has been saved in the db
    const cryptoToken = crypto.createHash('sha256').update(resetToken).
        digest('hex')

    console.log(resetToken)

    //Find the user by the crypto token
    const userFound = await User.findOne({
        passwordResetToken: cryptoToken,
        passwordResetExpires:{$gt : Date.now()}
    })
    if(!userFound){
        throw new Error( 'Password reset token is invalid or has expired')
    }
    //Update the user password
    const salt = await bcrypt.genSalt(10);
    userFound.password = await bcrypt.hash(password, salt)
    userFound.passwordResetExpires = undefined;
    userFound.passwordResetToken = undefined
    
    //resave the user
    await userFound.save()

    res.json({
        message: 'Password reset successfully',
        
    })
})




//@desc send  Account verification    email
//@route PUT /api/v1/users/account-verification-email/
//@access Private



exports.accountVerificationEmail = asyncHandler(async (req, res) => {
    //Find the login user email
    const user = await User.findById(req?.userAuth?._id);
    if (!user) {
      throw new Error("User not found");
    }
    //send the token
    const token = await user.generateAccVerificationToken();
    //resave
    await user.save();
    //send the email
    sendAccVerificationEmail(user?.email, token);
    res.status(200).json({
      message: `Account verification email sent ${user?.email}`,
    });
  });
  
  



//@desc  Verify Token   
//@route PUT /api/v1/users/verify-account/:verifyToken
//@access Private

exports.verifyAccount = asyncHandler(async (req, res) => {
    //Get the id/token params
    const { verifyToken } = req.params;
    //Convert the token to actual token that has been saved in the db
    const cryptoToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");
    //find the user by the crypto token
    const userFound = await User.findOne({
      accountVerificationToken: cryptoToken,
      accountVerificationExpires: { $gt: Date.now() },
    });
    if (!userFound) {
      throw new Error("Account verification  token is invalid or has expired");
    }
    //Update user account
    userFound.isVerified = true;
    userFound.accountVerificationExpires = undefined;
    userFound.accountVerificationToken = undefined;
    //resave the user
    await userFound.save();
    res.status(200).json({ message: "Account  successfully verified" });
  });