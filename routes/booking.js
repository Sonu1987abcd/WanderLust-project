const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingsController = require("../controllers/bookings");

// Create order and initiate payment
router.post("/create-order", isLoggedIn, wrapAsync(bookingsController.createOrder));

// Verify payment
router.post("/verify-payment", isLoggedIn, wrapAsync(bookingsController.verifyPayment));

// Test Razorpay connection (for debugging - remove in production)
router.get("/test-razorpay", wrapAsync(bookingsController.testRazorpay));

// Get user bookings
router.get("/", isLoggedIn, wrapAsync(bookingsController.getUserBookings));

// Get booking details
router.get("/:id", isLoggedIn, wrapAsync(bookingsController.getBookingDetails));

module.exports = router;
