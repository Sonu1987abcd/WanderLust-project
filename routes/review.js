const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync");
const { validateReview ,isLoggedIn,isReviewAuthor} = require("../middleware");
const reviewsController=require("../controllers/reviews");

// //  // Reviews
// // post Reviews route
router.post("/",isLoggedIn,validateReview , wrapAsync(reviewsController.createReview));

// // Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewsController.destroyReview));

module.exports=router;