const express = require('express')
const { register, login, getProfile, blockUser, unblockUser, profileViewers, followingUser, UnFollowingUser, forgotPassword, resetPassword, accountVerificationEmail, verifyAccount } = require('../../controllers/users/usersCtrl')
const isLoggin = require('../../middlewares/isLoggin')

const usersRouter = express.Router()

//!Register
usersRouter.post('/register', register)

// login
usersRouter.post('/login', login)

//profile
usersRouter.get("/profile", isLoggin, getProfile)


//? block user
usersRouter.put("/block/:userIdToBlock", isLoggin, blockUser)

//! unblock user

usersRouter.put("/unblock/:userIdToUnBlock", isLoggin, unblockUser)

//? profile viewers 
usersRouter.get('/profile-viewer/:userProfileId', isLoggin, profileViewers)

//following user
usersRouter.put('/following/:userToFollowId', isLoggin, followingUser)

//unfollowing user
usersRouter.put('/unfollowing/:userToUnFollowId', isLoggin, UnFollowingUser)



//Forgot password 
usersRouter.post('/forgot-password',forgotPassword)


//Reset password 
usersRouter.post('/reset-password/:resetToken',resetPassword)


//Send Account verification email 
usersRouter.put('/account-verification-email',isLoggin, accountVerificationEmail)


//Send Account verification email 
usersRouter.put('/account-verification/:verifyToken',isLoggin, verifyAccount)



//* Export
module.exports = usersRouter;

