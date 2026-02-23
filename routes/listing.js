const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync");
const Listing = require("../models/listing");
const {isLoggedIn,isListingOwner,validateListing,isAdmin}=require("../middleware"); 
const listingsController=require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

// // // router.route() is a way to group together routes with different verbs but same paths
// // // router.route() lets you define multiple HTTP methods for the same path in a clean, chained way.
router.route("/")
.get(wrapAsync(listingsController.index))
.post(isLoggedIn, isAdmin, validateListing, upload.single("listing[image]"), wrapAsync(listingsController.createListing));

// New listing - admin only
router.get("/new", isLoggedIn, isAdmin, listingsController.newListing);

router.route("/:id")
.get(wrapAsync(listingsController.showListing))
.put(isLoggedIn, isAdmin, isListingOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingsController.updateListing))
.delete(isLoggedIn, isAdmin, isListingOwner, wrapAsync(listingsController.destroyListing));

// Edit listing - admin only (and must be owner)
router.get("/:id/edit", isLoggedIn, isAdmin, isListingOwner, wrapAsync(listingsController.editListing));

module.exports=router;