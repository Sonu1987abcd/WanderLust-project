const User=require("../models/user");

module.exports.renderSignup=(req, res) => {
    res.render("users/signup"); 
};

module.exports.signup=async(req, res) => {
    try{
    let {username,email,password}=req.body;
    if (!password || password.length < 6) {
        req.flash("error", "Password must be at least 6 characters long.");
        return res.redirect("/signup");
    }
    let user=new User({username,email});
    const newUser= await User.register(user,password);
    console.log(newUser);
    req.login(newUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wanderlust! You can now book destinations and make real-time payments.");
        // Redirect to listings page where they can book
        res.redirect("/listings");
    });
    }catch(e){
        // Handle duplicate email or username (MongoDB E11000)
        if (e.code === 11000 || (e.message && e.message.includes("duplicate key"))) {
            req.flash("error", "An account with this email or username already exists. Please login instead.");
            return res.redirect("/login");
        }
        req.flash("error", e.message || "Something went wrong. Please try again.");
        res.redirect("/signup");
    }
};

module.exports.renderLogin=(req, res) => {
    res.render("users/login.ejs");
};

module.exports.login=async(req, res) => {
    req.flash("success","Welcome back to Wanderlust! You can now book destinations and make real-time payments.");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Profile: same route for all logged-in users; view shows admin vs user content
module.exports.profile = (req, res) => {
    res.render("users/profile");
};

// Update profile avatar (photo)
module.exports.updateAvatar = async (req, res) => {
    if (!req.file) {
        req.flash("error", "Please select an image to upload.");
        return res.redirect("/profile");
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/login");
    }
    user.avatar = {
        url: req.file.path,
        filename: req.file.filename,
    };
    await user.save();
    req.flash("success", "Profile photo updated successfully.");
    res.redirect("/profile");
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
          return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    });
};

// Change password (logged-in user)
module.exports.renderChangePassword = (req, res) => {
    res.render("users/change-password.ejs");
};

module.exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            req.flash("error", "All fields are required.");
            return res.redirect("/change-password");
        }

        if (newPassword !== confirmPassword) {
            req.flash("error", "New password and confirm password do not match.");
            return res.redirect("/change-password");
        }

        if (newPassword.length < 6) {
            req.flash("error", "New password must be at least 6 characters long.");
            return res.redirect("/change-password");
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/login");
        }

        await user.changePassword(currentPassword, newPassword);
        req.flash("success", "Your password has been changed successfully.");
        res.redirect("/listings");
    } catch (e) {
        if (e.name === "IncorrectPasswordError" || e.message?.includes("Password or username is incorrect")) {
            req.flash("error", "Current password is incorrect.");
        } else {
            req.flash("error", e.message || "Failed to change password.");
        }
        res.redirect("/change-password");
    }
};

// Forgot / Reset password - render form (user enters email + new password)
module.exports.renderForgotPassword = (req, res) => {
    res.render("users/forgot-password.ejs");
};

module.exports.resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!email || !newPassword || !confirmPassword) {
            req.flash("error", "All fields are required.");
            return res.redirect("/forgot-password");
        }

        if (newPassword !== confirmPassword) {
            req.flash("error", "New password and confirm password do not match.");
            return res.redirect("/forgot-password");
        }

        if (newPassword.length < 6) {
            req.flash("error", "New password must be at least 6 characters long.");
            return res.redirect("/forgot-password");
        }

        const user = await User.findOne({ email: email.trim() });
        if (!user) {
            req.flash("error", "No account found with this email address.");
            return res.redirect("/forgot-password");
        }

        await user.setPassword(newPassword);
        await user.save();
        req.flash("success", "Your password has been reset successfully. Please login with your new password.");
        res.redirect("/login");
    } catch (e) {
        req.flash("error", e.message || "Failed to reset password.");
        res.redirect("/forgot-password");
    }
};