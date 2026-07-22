import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import '../styles/profile.css';
import { API_URL } from '../api';

const Profile = () => {
    const { user, logout, wishlist } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Wishlist and Tabs state
    const [activeTab, setActiveTab] = useState('orders');
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await fetch(`${API_URL}/api/orders/myorders`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                } else {
                    setError('Failed to load order history.');
                }
            } catch (err) {
                setError('Could not connect to server.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    // Fetch wishlist items
    useEffect(() => {
        if (!user || activeTab !== 'wishlist') return;

        const fetchWishlist = async () => {
            setWishlistLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/auth/wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWishlistItems(data);
                }
            } catch (err) {
                console.error('Error fetching wishlist:', err);
            } finally {
                setWishlistLoading(false);
            }
        };

        fetchWishlist();
    }, [user, activeTab]);

    // Sync wishlist item removal instantly
    useEffect(() => {
        setWishlistItems((prev) => prev.filter((item) => wishlist.includes(item._id)));
    }, [wishlist]);

    if (!user) return null;

    return (
        <div className="profile-page-container container section-padding">
            <div className="profile-grid">
                {/* User Info Column */}
                <div className="profile-info-card">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="profile-details">
                        <h2 className="serif-heading profile-name">{user.name}</h2>
                        <p className="profile-email">{user.email}</p>
                        
                        <div className="profile-badge-row">
                            <span className="profile-badge">
                                {user.role === 'company' ? 'Seller' : user.role === 'admin' ? 'Admin' : 'Customer'}
                            </span>
                        </div>

                        <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary profile-logout-btn">
                            Logout Account
                        </button>
                    </div>
                </div>

                {/* Main Content Column */}
                <div className="profile-main-content">
                    <div className="profile-tabs">
                        <button 
                            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Order History
                        </button>
                        <button 
                            className={`profile-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                            onClick={() => setActiveTab('wishlist')}
                        >
                            Saved Items
                        </button>
                    </div>

                    {activeTab === 'orders' ? (
                        <div className="profile-orders-section">
                            <h2 className="serif-heading section-title">Your Order History</h2>

                            {loading ? (
                                <div className="orders-loading">Loading your orders...</div>
                            ) : error ? (
                                <div className="orders-error">{error}</div>
                            ) : orders.length > 0 ? (
                                <div className="orders-list">
                                    {orders.map((order) => (
                                        <div key={order._id} className="order-history-card">
                                            <div className="order-card-header">
                                                <div>
                                                    <span className="order-meta-label">Order Number</span>
                                                    <span className="order-meta-value">{order._id}</span>
                                                </div>
                                                <div>
                                                    <span className="order-meta-label">Placed On</span>
                                                    <span className="order-meta-value">
                                                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="order-meta-label">Total Paid</span>
                                                    <span className="order-meta-value order-total-value">
                                                        ${order.totalAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="order-meta-label">Status</span>
                                                    <span className={`order-status-tag ${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="order-card-items">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="order-item-row">
                                                        <div className="order-item-info">
                                                            <span className="order-item-title">
                                                                {item.product ? item.product.name : 'Curated Item'}
                                                            </span>
                                                            <span className="order-item-qty">Qty: {item.qty}</span>
                                                        </div>
                                                        <span className="order-item-price">${(item.price * item.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="orders-empty-state">
                                    <h3 className="serif-heading">No Orders Placed Yet</h3>
                                    <p>Once you purchase items, they will be listed here with tracking and receipt details.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="profile-wishlist-section">
                            <h2 className="serif-heading section-title">Your Saved Items</h2>

                            {wishlistLoading ? (
                                <div className="orders-loading">Loading saved items...</div>
                            ) : wishlistItems.length > 0 ? (
                                <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' }}>
                                    {wishlistItems.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="orders-empty-state">
                                    <h3 className="serif-heading">Your Wishlist is Empty</h3>
                                    <p>Find pieces you love and tap the heart icon to save them here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
