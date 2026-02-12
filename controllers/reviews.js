const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview=async (req, res) => {
    const listing=await Listing.findById(req.params.id);
    const newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview); 
    await newReview.save();
    await listing.save();
    req.flash("success","Successfully added a review!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{ $pull:{reviews:reviewId}});
    let deletedReview=await Review.findByIdAndDelete(reviewId);
    console.log(deletedReview);
    req.flash("success","Successfully deleted a review!");
    res.redirect(`/listings/${ id}`);
};