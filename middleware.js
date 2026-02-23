const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError=require("./utils/ExpressError"); 
const { listingSchema,reviewSchema} = require("./schema");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","You must be logged in to book a destination!");
    
    // If it's an API request (JSON), return JSON response
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please login to book.",
            redirect: "/login"
        });
    }
    
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isListingOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// Only admin can create/edit/delete listings (other users can only book)
module.exports.isAdmin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in.");
        return res.redirect("/login");
    }
    const adminEmail=process.env.ADMIN_EMAIL || "";
    if(!adminEmail || req.user.email!==adminEmail){
        req.flash("error","Only admin can create or manage listings. You can book hotels.");
        return res.redirect("/listings");
    }
    next();
}

module.exports.validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map(el=>el.message).join(", ");
    throw new ExpressError(errMsg, 400);
  }else{
    next();
  }
}

module.exports.validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map(el=>el.message).join(", ");
    throw new ExpressError(errMsg, 400);
  }else{
    next();
  }
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}