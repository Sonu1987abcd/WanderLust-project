const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");
const usersController=require("../controllers/users");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/signup")
.get(usersController.renderSignup)
.post(wrapAsync(usersController.signup)
);

router.route("/login")
.get(usersController.renderLogin)
.post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),wrapAsync(usersController.login)
);

router.get("/profile", isLoggedIn, usersController.profile);
router.post("/profile/avatar", isLoggedIn, upload.single("avatar"), wrapAsync(usersController.updateAvatar));
router.get("/logout",usersController.logout);

// Change password (logged-in user)
router.get("/change-password", isLoggedIn, usersController.renderChangePassword);
router.post("/change-password", isLoggedIn, wrapAsync(usersController.changePassword));

// Forgot / Reset password (user not logged in)
router.get("/forgot-password", usersController.renderForgotPassword);
router.post("/forgot-password", wrapAsync(usersController.resetPassword));

module.exports=router;