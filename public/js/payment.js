// Payment handling script
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    const checkInDate = document.getElementById('checkInDate');
    const checkOutDate = document.getElementById('checkOutDate');
    const guests = document.getElementById('guests');
    const priceInfo = document.getElementById('priceInfo');
    const totalAmount = document.getElementById('totalAmount');
    const nightsInfo = document.getElementById('nightsInfo');
    const bookBtn = document.getElementById('bookBtn');
    const displayPrice = document.getElementById('displayPrice');

    if (!bookingForm) return;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    checkInDate.setAttribute('min', today);
    checkOutDate.setAttribute('min', today);

    // Calculate total price (including 18% tax) when dates change
    function calculateTotal() {
        if (checkInDate.value && checkOutDate.value) {
            const checkIn = new Date(checkInDate.value);
            const checkOut = new Date(checkOutDate.value);
            
            if (checkOut > checkIn) {
                const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                const pricePerNight = listing.price;
                const baseTotal = pricePerNight * nights;
                const taxAmount = Math.round(baseTotal * 0.18); // 18% GST
                const total = baseTotal + taxAmount;
                
                totalAmount.textContent = '₹' + total.toLocaleString('en-IN');
                nightsInfo.textContent = `${nights} night${nights > 1 ? 's' : ''} × ₹${pricePerNight.toLocaleString('en-IN')}/night (Base: ₹${baseTotal.toLocaleString('en-IN')}, Tax 18%: ₹${taxAmount.toLocaleString('en-IN')})`;
                priceInfo.style.display = 'block';
                
                // Update button text
                const guestsCount = guests.value || 1;
                bookBtn.innerHTML = `<i class="fa-solid fa-credit-card"></i> Pay & Book - ₹${total.toLocaleString('en-IN')}`;
            } else {
                priceInfo.style.display = 'none';
            }
        } else {
            priceInfo.style.display = 'none';
        }
    }

    checkInDate.addEventListener('change', function() {
        if (checkInDate.value) {
            const minCheckOut = new Date(checkInDate.value);
            minCheckOut.setDate(minCheckOut.getDate() + 1);
            checkOutDate.setAttribute('min', minCheckOut.toISOString().split('T')[0]);
        }
        calculateTotal();
    });

    checkOutDate.addEventListener('change', calculateTotal);
    guests.addEventListener('change', calculateTotal);

    // Handle form submission
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate listing object is available
        if (!listing || !listing._id) {
            console.error('Listing object not found:', listing);
            alert('Error: Listing information not available. Please refresh the page.');
            return;
        }

        if (!checkInDate.value || !checkOutDate.value || !guests.value) {
            alert('Please fill in all fields');
            return;
        }

        const checkIn = new Date(checkInDate.value);
        const checkOut = new Date(checkOutDate.value);
        
        if (checkOut <= checkIn) {
            alert('Check-out date must be after check-in date');
            return;
        }

        // Disable button
        bookBtn.disabled = true;
        bookBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        try {
            // Create order for REAL-TIME PAYMENT
            const response = await fetch('/bookings/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listingId: listing._id || listing.id,
                    checkInDate: checkInDate.value,
                    checkOutDate: checkOutDate.value,
                    guests: parseInt(guests.value) || 1
                })
            });

            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
                alert('Please login to book this destination. Redirecting to login page...');
                window.location.href = '/login';
                return;
            }

            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                // Show detailed error message with helpful information
                const errorMsg = data.message || data.error || 'Failed to create order';
                const helpMsg = data.helpMessage || '';
                const fullErrorMsg = errorMsg + (helpMsg ? '\n\n' + helpMsg : '');
                
                console.error('Order creation failed:', {
                    message: data.message,
                    error: data.error,
                    errorCode: data.errorCode,
                    errorSource: data.errorSource,
                    helpMessage: data.helpMessage
                });
                
                throw new Error(fullErrorMsg);
            }

            // Check if Razorpay is loaded
            if (typeof Razorpay === 'undefined') {
                throw new Error('Razorpay checkout script not loaded. Please refresh the page.');
            }

            // Calculate nights for description
            const checkIn = new Date(checkInDate.value);
            const checkOut = new Date(checkOutDate.value);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

            // Initialize Razorpay checkout for REAL-TIME PAYMENT
            const options = {
                key: data.order.key_id, // Key ID from backend
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'WanderLust',
                description: `Booking for ${listing.title} - ${nights} night(s)`,
                order_id: data.order.id,
                handler: async function(response) {
                    // Verify payment
                    try {
                        const verifyResponse = await fetch('/bookings/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: data.bookingId
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            // Show success message and redirect
                            alert('✅ Payment Successful! Your booking is confirmed. Redirecting to your bookings...');
                            window.location.href = '/bookings';
                        } else {
                            alert('❌ Payment verification failed: ' + verifyData.message);
                            bookBtn.disabled = false;
                            bookBtn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Pay & Book Now';
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment verification failed. Please contact support.');
                        bookBtn.disabled = false;
                        bookBtn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Pay & Book';
                    }
                },
                prefill: {
                    name: listing.owner?.username || '',
                    email: '', // You can add user email if available
                    contact: '' // You can add user contact if available
                },
                theme: {
                    color: '#fe424d'
                },
                modal: {
                    ondismiss: function() {
                        bookBtn.disabled = false;
                        bookBtn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Pay & Book';
                    }
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();
            razorpay.on('payment.failed', function(response) {
                alert('Payment failed: ' + response.error.description);
                bookBtn.disabled = false;
                bookBtn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Pay & Book';
            });

        } catch (error) {
            console.error('Error:', error);
            
            // Show detailed error message
            let errorMessage = error.message || 'An error occurred';
            
            // Add troubleshooting tips for Razorpay errors
            if (errorMessage.includes('Razorpay') || errorMessage.includes('payment gateway') || errorMessage.includes('Payment gateway')) {
                errorMessage += '\n\nTroubleshooting:\n';
                errorMessage += '1. Check if Razorpay keys are correct in .env\n';
                errorMessage += '2. Restart the server after changing .env\n';
                errorMessage += '3. Visit /bookings/test-razorpay to test connection\n';
                errorMessage += '4. Check server console for detailed error logs';
            }
            
            alert('Error: ' + errorMessage);
            bookBtn.disabled = false;
            bookBtn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Pay & Book Now';
        }
    });
});
