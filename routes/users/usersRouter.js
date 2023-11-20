const express = require("express");
const {
  register,
  login,
  blockUser,
  unblockUser,
  profileViewers,
  followingUser,
  UnFollowingUser,
  forgotPassword,
  resetPassword,
  accountVerificationEmail,
  verifyAccount,
  getPrivateProfile,
  getPublicProfile,
  uploadProfilePicture,
  uploadCoverImage,
  updateUserProfile,
} = require("../../controllers/users/usersCtrl");
const isLoggin = require("../../middlewares/isLoggin");
const storage = require("../../utils/fileUpload");
const multer = require("multer");

const usersRouter = express.Router();

//!file upload middleware
const upload = multer({ storage });

//!Register (commented coz profile image not required in the frontend while registering, just fr reference commented)
// usersRouter.post('/register',upload.single('profilePicture'), register)
usersRouter.post("/register", register);

// login
usersRouter.post("/login", login);

// upload Profile image
usersRouter.put(
  "/upload-profile-image",
  isLoggin,
  upload.single("file"),
  uploadProfilePicture
);

// upload Cover image
usersRouter.put(
  "/upload-cover-image",
  isLoggin,
  upload.single("file"),
  uploadCoverImage
);

//profile
usersRouter.get("/profile/", isLoggin, getPrivateProfile);

//public profile
usersRouter.get("/public-profile/:userId", getPublicProfile);

//! Update profile
usersRouter.put("/update-profile/", isLoggin, updateUserProfile);

//? block user
usersRouter.put("/block/:userIdToBlock", isLoggin, blockUser);

//! unblock user

usersRouter.put("/unblock/:userIdToUnBlock", isLoggin, unblockUser);

//? profile viewers
usersRouter.get("/profile-viewer/:userProfileId", isLoggin, profileViewers);

//following user
usersRouter.put("/following/:userToFollowId", isLoggin, followingUser);

//unfollowing user
usersRouter.put("/unfollowing/:userToUnFollowId", isLoggin, UnFollowingUser);

//Forgot password
usersRouter.post("/forgot-password", forgotPassword);

//Reset password
usersRouter.post("/reset-password/:resetToken", resetPassword);

//Send Account verification email
usersRouter.put(
  "/account-verification-email",
  isLoggin,
  accountVerificationEmail
);

//Get Account verification email
usersRouter.get("/account-verification/:verifyToken", isLoggin, verifyAccount);

//* Export
module.exports = usersRouter;
