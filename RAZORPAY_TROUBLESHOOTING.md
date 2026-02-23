# 🔧 Razorpay Payment Error Troubleshooting Guide

## ❌ Error: "Payment gateway error: Failed to create payment order"

### Step 1: Test Razorpay Connection

Visit this URL in your browser to test if Razorpay is working:
```
http://localhost:5010/bookings/test-razorpay
```

**Expected Result:**
- ✅ Success: `{"success":true,"message":"Razorpay connection successful!"}`
- ❌ Failure: Will show the exact error from Razorpay

### Step 2: Check Server Console Logs

When you try to book, check the **server console** (terminal where `node app.js` is running) for:

```
❌ Razorpay API Error Details:
Error description: [actual error from Razorpay]
Error code: [error code]
Error source: [where error occurred]
```

### Step 3: Common Issues & Solutions

#### Issue 1: Invalid Razorpay Keys
**Symptoms:**
- Error code: `BAD_REQUEST_ERROR` or `UNAUTHORIZED_ERROR`
- Error description mentions "key" or "authentication"

**Solution:**
1. Go to https://dashboard.razorpay.com/app/keys
2. Verify your keys are correct
3. Make sure you're using **Test Mode** keys (start with `rzp_test_`)
4. Update `.env` file
5. **Restart server**

#### Issue 2: Network/Connectivity Issues
**Symptoms:**
- Error: "ECONNREFUSED" or "ETIMEDOUT"
- No response from Razorpay

**Solution:**
- Check internet connection
- Check firewall settings
- Verify Razorpay API is accessible

#### Issue 3: Invalid Amount Format
**Symptoms:**
- Error: "Invalid amount" or "Amount must be"
- Amount validation errors

**Solution:**
- Amount must be between ₹1 and ₹100,000
- Amount is automatically converted to paise (×100)
- Check listing price is valid

#### Issue 4: Razorpay Account Restrictions
**Symptoms:**
- Error: "Account not activated" or "Feature not enabled"
- Error code: `BAD_REQUEST_ERROR`

**Solution:**
- Check Razorpay dashboard for account status
- Verify Orders API is enabled
- Contact Razorpay support if needed

### Step 4: Verify Your Setup

#### Check `.env` File:
```env
RAZORPAY_KEY_ID=rzp_test_SHiFH9MYwJxBV5
RAZORPAY_KEY_SECRET=nfM7Ki7gowMqVPsCF0oA9bPG
```

#### Check Server Startup:
Look for this message when server starts:
```
✅ Razorpay initialized successfully with Key ID: rzp_test_S...
```

If you see:
```
⚠️ Warning: Razorpay keys not configured
```
Then your keys are not being loaded correctly.

### Step 5: Test with Minimal Order

Try creating a booking with:
- **Check-in:** Today
- **Check-out:** Tomorrow (1 night)
- **Guests:** 1
- **Listing price:** Should be at least ₹1

This creates the smallest possible order (₹1 = 100 paise).

### Step 6: Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for JavaScript errors
- Check Network tab for API responses
- Verify the request is being sent correctly

### Step 7: Detailed Error Information

The improved error handling now shows:
- **Error description** - What went wrong
- **Error code** - Razorpay error code
- **Error source** - Where the error occurred
- **Error step** - Which step failed

### 🔍 Debugging Checklist

- [ ] Server shows "✅ Razorpay initialized successfully"
- [ ] `/bookings/test-razorpay` endpoint works
- [ ] Razorpay keys are correct in `.env`
- [ ] Server restarted after changing `.env`
- [ ] Listing has valid price (> 0)
- [ ] Dates are valid (check-out > check-in)
- [ ] User is logged in
- [ ] Internet connection is working
- [ ] Check server console for detailed errors

### 📞 Still Having Issues?

1. **Check Server Logs** - Look for detailed error messages
2. **Test Razorpay** - Visit `/bookings/test-razorpay`
3. **Verify Keys** - Double-check Razorpay dashboard
4. **Check Amount** - Ensure it's between ₹1-₹100,000
5. **Contact Support** - Share the exact error from server logs

---

## 🎯 Quick Test

1. **Test Razorpay Connection:**
   ```
   http://localhost:5010/bookings/test-razorpay
   ```

2. **Try Booking Again:**
   - Login
   - Go to listings
   - Click any listing
   - Fill booking form
   - Click "Pay & Book Now"
   - **Check server console** for detailed error

3. **Share Error Details:**
   - Copy the error from server console
   - Include error description, code, and source
   - This will help identify the exact issue

---

**The server now has improved error logging. Check the server console for detailed error information!**
