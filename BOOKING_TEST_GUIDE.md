# 🚀 Booking System - Test Guide

## ✅ Implementation Complete & Server Running!

Your Razorpay payment gateway integration is now **LIVE** and the server is running on **http://localhost:8010**

## 🎯 How to Test the Booking Flow

### Step 1: Access the Application
1. Open your browser and go to: **http://localhost:8010**
2. Navigate to **http://localhost:8010/listings** to see all destinations

### Step 2: View a Listing
1. Click on any listing to view its details
2. You'll see the listing information including:
   - Title, description, price, location
   - Owner information
   - **NEW: Booking Form** (if you're logged in and not the owner)

### Step 3: Book a Destination
1. **Login Required**: Make sure you're logged in (if not, sign up/login first)
2. **Fill Booking Form**:
   - Select **Check-in Date** (must be today or later)
   - Select **Check-out Date** (must be after check-in)
   - Enter **Number of Guests**
   - The total amount will be calculated automatically (price × nights)
3. Click **"Book Now"** button

### Step 4: Complete Payment

**Two Payment Methods Available:**

#### Method 1: Razorpay Checkout (If API Keys Configured)
- Razorpay checkout popup will open
- Enter payment details
- Payment is verified automatically
- Booking status updates to "completed"

#### Method 2: Payment Link (Current Setup - Fallback)
- You'll be redirected to your Razorpay payment link
- Complete payment on Razorpay's page
- Booking is saved with "pending" status
- You can manually update status after payment

### Step 5: View Your Bookings
1. Click **"My Bookings"** in the navbar
2. See all your bookings with:
   - Listing details
   - Check-in/Check-out dates
   - Amount paid
   - Booking status
3. Click on any booking to see full details

## 🔧 Current Configuration

### Payment Method: Payment Link (Fallback Mode)
- **Payment Link**: https://rzp.io/rzp/o7LD7py
- This is used when Razorpay API keys are not configured
- Bookings are created with "pending" status
- You can manually verify payments later

### To Enable Full Razorpay Checkout:
1. Get your Razorpay API keys from: https://dashboard.razorpay.com/app/keys
2. Update `.env` file:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_key_secret_here
   ```
3. Restart the server

## 📋 Features Implemented

✅ **Booking Form** - Date selection, guest count, price calculation  
✅ **Payment Integration** - Razorpay payment link/checkout  
✅ **Booking Management** - View all bookings  
✅ **Booking Details** - Detailed view of each booking  
✅ **User Authentication** - Only logged-in users can book  
✅ **Owner Protection** - Owners can't book their own listings  
✅ **Price Calculation** - Automatic calculation (price × nights)  
✅ **Date Validation** - Prevents invalid date selections  

## 🧪 Test Scenarios

### Test 1: Basic Booking Flow
1. Login as a user
2. Browse listings
3. Select a listing you don't own
4. Fill booking form
5. Click "Book Now"
6. Complete payment
7. Check "My Bookings" page

### Test 2: Date Validation
1. Try selecting check-out date before check-in date
2. System should prevent invalid selections
3. Total amount updates automatically when dates change

### Test 3: Owner Protection
1. Login as a listing owner
2. View your own listing
3. Booking form should NOT appear
4. Only "Edit" and "Delete" buttons visible

### Test 4: Guest Count
1. Change number of guests
2. Price should remain the same (per night pricing)
3. Total updates based on nights only

## 🎨 UI Features

- **Responsive Design** - Works on all screen sizes
- **Real-time Price Calculation** - See total as you select dates
- **Visual Feedback** - Loading states, success/error messages
- **Status Badges** - Color-coded booking status
- **Booking Cards** - Beautiful card layout for bookings

## 📝 Notes

- Server is running on **port 8010**
- Database connection: MongoDB Atlas
- Payment gateway: Razorpay
- All amounts in Indian Rupees (₹)

## 🐛 Troubleshooting

**Booking form not showing?**
- Make sure you're logged in
- Make sure you're not viewing your own listing

**Payment link not working?**
- Check if the payment link is correct in `.env`
- Verify Razorpay account is active

**Server not responding?**
- Check if server is running: Look for "Server is running on port 8010" message
- Check MongoDB connection
- Verify all dependencies are installed: `npm install`

## 🎉 Ready to Use!

Your booking system is now fully functional! Users can:
1. Browse destinations
2. View listing details
3. Book destinations with payment
4. Manage their bookings

**Happy Testing!** 🚀
