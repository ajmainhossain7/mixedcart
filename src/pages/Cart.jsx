import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/cart.css';

const Cart = () => {
    const { cartItems, updateCartQty, removeFromCart, cartTotal } = useContext(CartContext);
    const navigate = useNavigate();

    const shippingThreshold = 150;
    const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 15;
    const taxRate = 0.08; // 8%
    const taxCost = cartTotal * taxRate;
    const orderTotal = cartTotal + shippingCost + taxCost;

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="cart-page-container container section-padding">
            <header className="cart-header">
                <h1 className="serif-heading cart-title">Your Shopping Bag</h1>
            </header>

            {cartItems.length > 0 ? (
                <div className="cart-content-layout">
                    {/* Cart Items List */}
                    <div className="cart-items-column">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item-card">
                                <div className="cart-item-image-wrapper">
                                    <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                                </div>
                                <div className="cart-item-details">
                                    <div className="cart-item-header">
                                        <span className="cart-item-category">{item.category}</span>
                                        <h3 className="serif-heading cart-item-name">{item.name}</h3>
                                    </div>
                                    <div className="cart-item-price-qty-row">
                                        <span className="cart-item-price">${item.price}</span>
                                        
                                        <div className="cart-item-qty-selector">
                                            <button 
                                                onClick={() => updateCartQty(item._id, item.qty - 1)}
                                                className="qty-btn"
                                                aria-label="Decrease quantity"
                                            >
                                                —
                                            </button>
                                            <span className="qty-value">{item.qty}</span>
                                            <button 
                                                onClick={() => updateCartQty(item._id, item.qty + 1)}
                                                className="qty-btn"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item._id)} 
                                    className="cart-item-remove-btn"
                                    aria-label="Remove item"
                                >
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Card */}
                    <div className="cart-summary-column">
                        <div className="cart-summary-card">
                            <h2 className="serif-heading summary-title">Order Summary</h2>
                            
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                            </div>
                            
                            <div className="summary-row">
                                <span>Estimated Tax (8%)</span>
                                <span>${taxCost.toFixed(2)}</span>
                            </div>

                            {shippingCost > 0 && (
                                <p className="shipping-hint">
                                    Add <strong>${(shippingThreshold - cartTotal).toFixed(2)}</strong> more for free shipping.
                                </p>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>${orderTotal.toFixed(2)}</span>
                            </div>

                            <button onClick={handleCheckout} className="btn-primary checkout-btn">
                                Proceed to Checkout
                            </button>

                            <Link to="/shop" className="continue-shopping-link">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="cart-empty-state">
                    <div className="empty-state-icon-wrapper">
                        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="serif-heading empty-title">Your Bag is Empty</h2>
                    <p className="empty-description">Curate your home and MixedCart with our premium minimalist collections.</p>
                    <Link to="/shop" className="btn-primary empty-shop-btn">
                        Shop Collection
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Cart;
