const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance
let razorpay;
let razorpayInitialized = false;
try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const usingPlaceholders =
        keyId === "your_razorpay_key_id_here" ||
        keySecret === "your_razorpay_key_secret_here";

    if (!keyId || !keySecret || usingPlaceholders) {
        console.warn("⚠️ Warning: Razorpay keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file");
    } else {
        razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
        razorpayInitialized = true;
        console.log("✅ Razorpay initialized successfully with Key ID:", keyId.substring(0, 10) + "...");
    }
} catch (error) {
    console.error("❌ Error initializing Razorpay:", error);
    razorpayInitialized = false;
}

// Create order and initiate payment
module.exports.createOrder = async (req, res) => {
    try {
        if (!razorpay || !razorpayInitialized) {
            console.error("❌ Razorpay not initialized. Check server logs for initialization errors.");
            return res.status(500).json({
                success: false,
                message: "Razorpay is not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env and restart the server."
            });
        }

        const { listingId, checkInDate, checkOutDate, guests } = req.body;
        
        if (!listingId || !checkInDate || !checkOutDate || !guests) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        // Validate listingId format
        if (!listingId || typeof listingId !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Invalid listing ID provided"
            });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ 
                success: false, 
                message: "Listing not found. Please refresh the page and try again." 
            });
        }

        // Validate user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login to book."
            });
        }

        // Calculate number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        if (nights <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Check-out date must be after check-in date" 
            });
        }

        // Validate listing price
        if (!listing.price || listing.price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid listing price. Please contact support."
            });
        }

        // Calculate total amount (price per night * number of nights, including 18% tax)
        const baseAmountInRupees = listing.price * nights;
        const taxAmountInRupees = Math.round(baseAmountInRupees * 0.18); // 18% GST
        const amountInRupees = baseAmountInRupees + taxAmountInRupees;

        // Validate calculated amount
        if (!amountInRupees || amountInRupees <= 0 || isNaN(amountInRupees)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking amount calculated. Please check dates and try again."
            });
        }

        // Calculate total amount in paise for Razorpay order (Razorpay uses paise)
        // Minimum amount is 100 paise (₹1)
        const amount = Math.round(amountInRupees * 100);
        
        if (amount < 100) {
            return res.status(400).json({
                success: false,
                message: "Minimum booking amount is ₹1. Please select more nights."
            });
        }

        // Prepare notes for order (will be added after order creation if needed)
        // Note: Some Razorpay accounts may have restrictions on notes
        const orderNotes = {
            listingId: listingId.toString(),
            userId: req.user._id.toString(),
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guests: guests.toString(),
            nights: nights.toString()
        };

        // Validate amount is within Razorpay limits (min 100 paise, max 10000000 paise = ₹100000)
        if (amount < 100 || amount > 10000000) {
            return res.status(400).json({
                success: false,
                message: `Amount must be between ₹1 and ₹100,000. Your amount is ₹${(amount/100).toFixed(2)}`
            });
        }

        // Ensure receipt is not too long (Razorpay limit: 40 characters)
        const receiptId = `receipt_${Date.now()}`.substring(0, 40);

        console.log("📦 Creating Razorpay order with options:", {
            amount: amount,
            amountInRupees: (amount / 100).toFixed(2),
            currency: "INR",
            receipt: receiptId,
            keyId: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET'
        });

        let order;
        try {
            // Create order with simplified options
            const orderOptions = {
                amount: amount,
                currency: "INR",
                receipt: receiptId
            };

            order = await razorpay.orders.create(orderOptions);
            console.log("✅ Razorpay order created successfully:", order.id);
            
            // Add notes after order creation if needed (optional)
            if (order.id) {
                console.log("Order details:", {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    status: order.status
                });
            }
        } catch (razorpayError) {
            console.error("❌ Razorpay API Error Details:");
            console.error("Full error:", razorpayError);
            console.error("Error type:", typeof razorpayError);
            console.error("Error keys:", Object.keys(razorpayError || {}));
            
            // Try to extract error details
            let errorDetails = {};
            try {
                if (razorpayError.error) {
                    errorDetails = razorpayError.error;
                    console.error("Error description:", errorDetails.description);
                    console.error("Error code:", errorDetails.code);
                    console.error("Error source:", errorDetails.source);
                    console.error("Error step:", errorDetails.step);
                    console.error("Error reason:", errorDetails.reason);
                    console.error("Error field:", errorDetails.field);
                }
                if (razorpayError.message) {
                    console.error("Error message:", razorpayError.message);
                }
                if (razorpayError.statusCode) {
                    console.error("HTTP Status:", razorpayError.statusCode);
                }
            } catch (logError) {
                console.error("Error logging Razorpay error:", logError);
            }
            
            // Provide more specific error messages
            let errorMessage = "Failed to create payment order";
            if (razorpayError.error) {
                if (razorpayError.error.description) {
                    errorMessage = razorpayError.error.description;
                } else if (razorpayError.error.reason) {
                    errorMessage = razorpayError.error.reason;
                } else if (razorpayError.error.message) {
                    errorMessage = razorpayError.error.message;
                }
            } else if (razorpayError.message) {
                errorMessage = razorpayError.message;
            }

            // Return detailed error for debugging - include actual Razorpay error
            const actualError = errorDetails.description || errorDetails.reason || razorpayError.message || "Unknown error";
            
            return res.status(500).json({
                success: false,
                message: "Payment gateway error: " + actualError,
                error: actualError,
                errorCode: errorDetails.code || "UNKNOWN",
                errorSource: errorDetails.source || "razorpay_api",
                errorStep: errorDetails.step || "order_creation",
                // Include helpful message based on error code
                helpMessage: errorDetails.code === "BAD_REQUEST_ERROR" 
                    ? "Please check your Razorpay keys in .env file and restart the server."
                    : errorDetails.code === "UNAUTHORIZED_ERROR"
                    ? "Invalid Razorpay credentials. Please verify your Key ID and Key Secret."
                    : "Please check server logs for more details."
            });
        }

        // Create booking record
        const booking = new Booking({
            listing: listingId,
            user: req.user._id,
            razorpayOrderId: order.id,
            amount: amount / 100, // Store in rupees
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guests: guests,
            status: 'pending' // Set as pending until payment is verified
        });

        await booking.save();
        console.log("✅ Booking record created:", booking._id);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                key_id: process.env.RAZORPAY_KEY_ID
            },
            bookingId: booking._id.toString()
        });
    } catch (error) {
        console.error("Error creating order:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create order: " + (error.message || "Unknown error occurred"),
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Verify payment
module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment verification data missing" 
            });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }

        // Verify signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            booking.status = 'failed';
            await booking.save();
            return res.status(400).json({ 
                success: false, 
                message: "Payment verification failed" 
            });
        }

        // Update booking with payment details
        booking.razorpayPaymentId = razorpay_payment_id;
        booking.razorpaySignature = razorpay_signature;
        booking.status = 'completed';
        await booking.save();

        req.flash("success", "Payment successful! Your booking is confirmed.");
        res.json({
            success: true,
            message: "Payment verified successfully",
            bookingId: booking._id
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ 
            success: false, 
            message: "Payment verification failed",
            error: error.message 
        });
    }
};

// Get user bookings
module.exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ bookingDate: -1 });
        
        res.render("bookings/index.ejs", { bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        req.flash("error", "Failed to fetch bookings");
        res.redirect("/listings");
    }
};

// Test Razorpay connection (for debugging)
module.exports.testRazorpay = async (req, res) => {
    try {
        if (!razorpay || !razorpayInitialized) {
            return res.json({
                success: false,
                message: "Razorpay not initialized",
                keyId: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET',
                keySecret: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET'
            });
        }

        // Try to create a test order (₹1 = 100 paise)
        const testOrder = await razorpay.orders.create({
            amount: 100, // ₹1
            currency: "INR",
            receipt: `test_${Date.now()}`
        });

        return res.json({
            success: true,
            message: "Razorpay connection successful!",
            testOrderId: testOrder.id,
            keyId: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET'
        });
    } catch (error) {
        console.error("Razorpay test error:", error);
        return res.json({
            success: false,
            message: "Razorpay test failed",
            error: error.error?.description || error.message || "Unknown error",
            errorCode: error.error?.code,
            errorDetails: error.error
        });
    }
};

// Get booking details
module.exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate("listing")
            .populate("user");
        
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/bookings");
        }

        // Check if user owns the booking
        if (!booking.user._id.equals(req.user._id)) {
            req.flash("error", "You don't have permission to view this booking");
            return res.redirect("/bookings");
        }

        res.render("bookings/show.ejs", { booking });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        req.flash("error", "Failed to fetch booking details");
        res.redirect("/bookings");
    }
};
