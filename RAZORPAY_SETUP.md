# Razorpay Payment Gateway Integration - Setup Instructions

## ✅ Implementation Complete

The Razorpay payment gateway has been successfully integrated into your destination booking system. Here's what has been implemented:

### Features Implemented:
1. ✅ **Booking Model** - Stores booking details, payment information, and booking status
2. ✅ **Payment Integration** - Razorpay checkout integration for secure payments
3. ✅ **Booking Form** - Added to listing show page with date selection and guest count
4. ✅ **Payment Verification** - Server-side payment verification using Razorpay signatures
5. ✅ **Booking Management** - Users can view their bookings and booking details
6. ✅ **My Bookings Page** - View all user bookings with status indicators

### Files Created/Modified:

**New Files:**
- `models/booking.js` - Booking model schema
- `controllers/bookings.js` - Booking and payment controllers
- `routes/booking.js` - Booking routes
- `views/bookings/index.ejs` - My Bookings page
- `views/bookings/show.ejs` - Booking details page
- `public/js/payment.js` - Razorpay payment handling JavaScript

**Modified Files:**
- `app.js` - Added booking routes
- `views/listings/show.ejs` - Added booking form
- `views/includes/navbar.ejs` - Added "My Bookings" link
- `.env` - Added Razorpay configuration placeholders
- `package.json` - Added razorpay dependency

## 🔧 Setup Instructions

### Step 1: Get Your Razorpay Keys

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. If you don't have API keys, click **Generate Keys**
4. Copy your **Key ID** and **Key Secret**

### Step 2: Update Environment Variables

Open your `.env` file and replace the placeholder values:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx  # Replace with your actual Key ID
RAZORPAY_KEY_SECRET=your_key_secret_here  # Replace with your actual Key Secret
```

**Important:** 
- For testing, use **Test Mode** keys (they start with `rzp_test_`)
- For production, use **Live Mode** keys (they start with `rzp_live_`)
- Never commit your `.env` file to version control

### Step 3: Restart Your Server

After updating the `.env` file, restart your Node.js server:

```bash
# Stop the current server (Ctrl+C)
# Then start it again
node app.js
```

## 📱 How to Use

### For Users:

1. **Browse Destinations** - Go to `/listings` to see all available destinations
2. **View Listing** - Click on any listing to see details
3. **Book Destination** - If logged in and not the owner:
   - Select check-in and check-out dates
   - Enter number of guests
   - Click "Book Now"
   - Complete payment through Razorpay checkout
4. **View Bookings** - Click "My Bookings" in the navbar to see all your bookings

### Payment Flow:

1. User fills booking form → Creates Razorpay order
2. Razorpay checkout opens → User completes payment
3. Payment verified → Booking status updated to "completed"
4. User redirected to "My Bookings" page

## 🔒 Security Features

- ✅ Payment signature verification
- ✅ Server-side order creation
- ✅ Secure payment handling
- ✅ Booking status tracking
- ✅ User authentication required for bookings

## 🧪 Testing

### Test Mode:
- Use Razorpay test credentials
- Test card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

### Test the Flow:
1. Create a test user account
2. Browse listings
3. Try booking a destination
4. Use test card details for payment
5. Verify booking appears in "My Bookings"

## 📝 Notes

- The payment link you provided (`https://rzp.io/rzp/o7LD7py`) is a Razorpay Payment Link. The implementation uses Razorpay Checkout, which is more suitable for integrated booking flows.
- If you prefer to use Payment Links instead, we can modify the implementation.
- All amounts are stored in Indian Rupees (INR)
- Booking amounts are calculated as: `price per night × number of nights`

## 🐛 Troubleshooting

**Issue: "Payment gateway not configured"**
- Solution: Make sure you've added `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to your `.env` file

**Issue: Payment verification fails**
- Solution: Check that your Key Secret matches your Key ID (test/live mode)

**Issue: Razorpay checkout doesn't open**
- Solution: Check browser console for errors, ensure Razorpay script is loaded

## 📞 Support

If you encounter any issues:
1. Check server logs for error messages
2. Verify Razorpay keys are correct
3. Ensure you're using the correct mode (test/live)
4. Check Razorpay dashboard for transaction logs

---

**Your server should now be running on port 8010!** 🚀

Visit `http://localhost:8010/listings` to start testing the booking functionality.
