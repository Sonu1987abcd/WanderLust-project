const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync");
const Listing = require("../models/listing");
const {isLoggedIn,isListingOwner,validateListing}=require("../middleware"); 
const listingsController=require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

// // // router.route() is a way to group together routes with different verbs but same paths
// // // router.route() lets you define multiple HTTP methods for the same path in a clean, chained way.
router.route("/")
.get(wrapAsync(listingsController.index))
.post(isLoggedIn ,validateListing, upload.single("listing[image]"),wrapAsync(listingsController.createListing)
);  

//New Route
router.get("/new",isLoggedIn ,listingsController.newListing);

router.route("/:id")
.get(wrapAsync(listingsController.showListing))
.put(isLoggedIn ,isListingOwner, upload.single("listing[image]"), validateListing,wrapAsync(listingsController.updateListing))
.delete(isLoggedIn ,isListingOwner,wrapAsync(listingsController.destroyListing)
);

//Edit Route
router.get("/:id/edit",isLoggedIn, isListingOwner,wrapAsync(listingsController.editListing));

module.exports=router;