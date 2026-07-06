import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/dashboard.css';

// Initialize stripe with Stripe elements promise
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OpG5qSFSsQ8lA7fN7t62N147G0k6r7Z8X3J9E');

const CheckoutForm = ({ amount, cartItems, onOrderSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        fullName: '',
        street: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            // Step 1: Request PaymentIntent clientSecret from Backend
            const intentRes = await fetch('http://localhost:5000/api/payment/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ amount })
            });

            if (!intentRes.ok) {
                const errData = await intentRes.json();
                throw new Error(errData.message || 'Failed to initialize payment.');
            }

            const { clientSecret } = await intentRes.json();

            // Step 2: Confirm Payment via Stripe SDK
            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: address.fullName,
                        address: {
                            line1: address.street,
                            city: address.city,
                            postal_code: address.postalCode,
                            country: address.country
                        }
                    }
                }
            });

            if (paymentResult.error) {
                throw new Error(paymentResult.error.message);
            }

            // Step 3: Create Order on Backend
            if (paymentResult.paymentIntent.status === 'succeeded') {
                const orderRes = await fetch('http://localhost:5000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        items: cartItems,
                        totalAmount: amount,
                        address,
                        paymentId: paymentResult.paymentIntent.id
                    })
                });

                if (orderRes.ok) {
                    setSuccessMsg('Payment and order completed successfully!');
                    if (onOrderSuccess) onOrderSuccess();
                    setTimeout(() => {
                        navigate('/profile');
                    }, 2000);
                } else {
                    const errData = await orderRes.json();
                    throw new Error(errData.message || 'Payment succeeded, but failed to create order record.');
                }
            }
        } catch (err) {
            setErrorMsg(err.message || 'An error occurred during checkout.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 className="serif-heading" style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Shipping Address</h3>
            <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={address.fullName} 
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={address.street} 
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={address.city} 
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Postal / ZIP Code</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={address.postalCode} 
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Country (2-letter ISO, e.g. US, IN, BD)</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        maxLength="2"
                        required 
                        value={address.country} 
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    />
                </div>
            </div>

            <h3 className="serif-heading" style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '16px' }}>Card Details</h3>
            <div style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: '15px',
                                color: '#000000',
                                fontFamily: 'var(--font-sans)',
                                '::placeholder': {
                                    color: '#7e7e7e',
                                },
                            },
                            invalid: {
                                color: '#e74c3c',
                            },
                        },
                    }}
                />
            </div>

            {errorMsg && <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '10px' }}>{errorMsg}</div>}
            {successMsg && <div style={{ color: '#27ae60', fontSize: '14px', marginTop: '10px' }}>{successMsg}</div>}

            <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '20px', width: '100%' }}
                disabled={loading || !stripe}
            >
                {loading ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
};

const Checkout = () => {
    const { user } = useContext(AuthContext);
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);

    // Calculate shipping, tax, total
    const shippingThreshold = 150;
    const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 15;
    const taxRate = 0.08;
    const taxCost = cartTotal * taxRate;
    const orderTotal = cartTotal + shippingCost + taxCost;

    // Format cart items for order creation
    const formattedItems = cartItems.map(item => ({
        product: item._id,
        qty: item.qty,
        price: item.price
    }));

    if (!user) {
        return (
            <div className="dashboard-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Please log in to proceed with checkout.</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="dashboard-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
                <p>Your shopping bag is empty.</p>
                <Link to="/shop" className="btn-primary">Shop Collection</Link>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '48px' }}>
                <div className="dashboard-content-section">
                    <Elements stripe={stripePromise}>
                        <CheckoutForm amount={orderTotal} cartItems={formattedItems} onOrderSuccess={clearCart} />
                    </Elements>
                </div>
                
                <div className="dashboard-content-section" style={{ backgroundColor: 'var(--bg-secondary)', height: 'fit-content', padding: '32px' }}>
                    <h3 className="serif-heading" style={{ fontSize: '22px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Order Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cartItems.map((item) => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                                <span>{item.name} (x{item.qty})</span>
                                <span style={{ fontWeight: '500' }}>${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Shipping</span>
                                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Estimated Tax (8%)</span>
                                <span>${taxCost.toFixed(2)}</span>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                            <span className="serif-heading">Total Amount</span>
                            <span className="serif-heading" style={{ color: 'var(--text-primary)' }}>${orderTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
