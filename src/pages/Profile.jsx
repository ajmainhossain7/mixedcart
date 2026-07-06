import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/profile.css';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/orders/myorders', {
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

                {/* Orders History Column */}
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
            </div>
        </div>
    );
};

export default Profile;
