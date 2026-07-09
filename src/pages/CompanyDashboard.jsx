import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import '../styles/dashboard.css';
import '../styles/chat.css';

const SellerChat = ({ user }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('connect', () => {
            console.log('Seller chat socket connected');
        });

        socketRef.current.on('receive_message', (message) => {
            setMessages((prev) => {
                if (prev.some(m => m._id === message._id)) return prev;
                if (activeConversation && message.conversation === activeConversation._id) {
                    return [...prev, message];
                }
                return prev;
            });

            // Update list
            setConversations((prevConvs) => {
                return prevConvs.map(conv => {
                    if (conv._id === message.conversation) {
                        return {
                            ...conv,
                            lastMessage: message.text,
                            lastMessageAt: message.createdAt
                        };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
            });
        });

        fetchConversations();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeConversation]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/messages/${convId}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        fetchMessages(conv._id);
        if (socketRef.current) {
            socketRef.current.emit('join_room', conv._id);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessageText.trim() || !activeConversation || !socketRef.current) return;

        socketRef.current.emit('send_message', {
            conversationId: activeConversation._id,
            senderId: user._id,
            text: newMessageText
        });
        setNewMessageText('');
    };

    return (
        <div className="seller-chat-layout">
            {/* Sidebar */}
            <div className="chat-dashboard-sidebar">
                <div className="chat-dashboard-sidebar-header">
                    <h3 className="chat-dashboard-sidebar-title">Customer Chats</h3>
                </div>
                <div className="chat-dashboard-list">
                    {conversations.length === 0 ? (
                        <p style={{ padding: '20px', color: 'var(--text-light)', fontSize: '13px', fontStyle: 'italic' }}>
                            No active customer chats yet.
                        </p>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv._id} 
                                className={`chat-dashboard-item ${activeConversation?._id === conv._id ? 'active' : ''}`}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                <div className="chat-dashboard-avatar">
                                    {conv.customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="chat-dashboard-info">
                                    <span className="chat-dashboard-name">{conv.customer.name}</span>
                                    <span className="chat-dashboard-msg">{conv.lastMessage || 'No messages yet'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-dashboard-main">
                {activeConversation ? (
                    <>
                        <div className="chat-dashboard-header">
                            <div className="chat-dashboard-user-info">
                                <div className="chat-dashboard-avatar">
                                    {activeConversation.customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14.5px', fontWeight: '600' }}>{activeConversation.customer.name}</h4>
                                    <span style={{ fontSize: '11px', color: '#2ecc71' }}>● Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="chat-dashboard-messages">
                            {messages.map(msg => (
                                <div key={msg._id} className={`chat-message-item ${msg.sender === user._id ? 'sent' : 'received'}`}>
                                    {msg.text}
                                    <span className="chat-message-timestamp">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-bar">
                            <input 
                                type="text"
                                className="chat-input-field"
                                placeholder="Type a response..."
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                            />
                            <button type="submit" className="chat-send-btn" disabled={!newMessageText.trim()}>
                                <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-dashboard-empty">
                        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        <h3 className="chat-dashboard-empty-title">Customer Messages</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Select a customer from the sidebar to view their messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CompanyDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('products');
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    
    // Profile form state
    const [profileData, setProfileData] = useState({
        companyName: '',
        description: '',
        address: '',
        phone: '',
        website: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    // Product form state
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: ''
    });
    const [productImage, setProductImage] = useState(null);
    
    // Seller orders state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Fetch seller orders when tab changes
    useEffect(() => {
        if (!user || user.role !== 'company' || activeTab !== 'orders') return;

        const fetchSellerOrders = async () => {
            setOrdersLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/orders/seller', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error('Error fetching seller orders:', err);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchSellerOrders();
    }, [user, activeTab]);

    const handleUpdateItemStatus = async (orderId, productId, newStatus) => {
        setMessage('');
        try {
            const res = await fetch(`http://localhost:5000/api/orders/seller/${orderId}/item/${productId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setOrders(orders.map(order => {
                    if (order._id === orderId) {
                        return {
                            ...order,
                            items: order.items.map(item => 
                                item.product._id === productId ? { ...item, status: newStatus } : item
                            )
                        };
                    }
                    return order;
                }));
                setMessage('Item fulfillment status updated successfully.');
            } else {
                const err = await res.json();
                setMessage(err.message || 'Failed to update item status.');
            }
        } catch (err) {
            setMessage('Error connecting to server.');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'company') return;

        const fetchCompanyData = async () => {
            try {
                // Fetch profile
                const profileRes = await fetch('http://localhost:5000/api/company/profile', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                if (profileRes.ok) {
                    const profileDataJson = await profileRes.json();
                    setProfile(profileDataJson);
                    setProfileData({
                        companyName: profileDataJson.companyName || '',
                        description: profileDataJson.description || '',
                        address: profileDataJson.address || '',
                        phone: profileDataJson.phone || '',
                        website: profileDataJson.website || ''
                    });
                }

                // Fetch products
                const productsRes = await fetch('http://localhost:5000/api/company/products', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProducts(productsData);
                }

                // Fetch seller analytics
                const analyticsRes = await fetch('http://localhost:5000/api/analytics/seller', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                if (analyticsRes.ok) {
                    const analyticsData = await analyticsRes.json();
                    setAnalytics(analyticsData);
                }
            } catch (error) {
                console.error('Error fetching company dashboard details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const formData = new FormData();
            formData.append('companyName', profileData.companyName);
            formData.append('description', profileData.description);
            formData.append('address', profileData.address);
            formData.append('phone', profileData.phone);
            formData.append('website', profileData.website);
            if (logoFile) formData.append('logo', logoFile);
            if (bannerFile) formData.append('banner', bannerFile);

            const res = await fetch('http://localhost:5000/api/company/profile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });

            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
                setMessage('Profile updated successfully.');
            } else {
                const err = await res.json();
                setMessage(err.message || 'Failed to update profile.');
            }
        } catch (error) {
            setMessage('An error occurred during submission.');
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!productImage) {
            setMessage('Product image is required.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('description', productData.description);
            formData.append('price', productData.price);
            formData.append('category', productData.category);
            formData.append('stock', productData.stock);
            formData.append('image', productImage);

            const res = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });

            if (res.ok) {
                const newProduct = await res.json();
                setProducts([newProduct, ...products]);
                setProductData({ name: '', description: '', price: '', category: '', stock: '' });
                setProductImage(null);
                setShowAddProduct(false);
                setMessage('Product added successfully!');
            } else {
                const err = await res.json();
                setMessage(err.message || 'Failed to add product.');
            }
        } catch (error) {
            setMessage('An error occurred during product upload.');
        }
    };

    if (!user || user.role !== 'company') {
        return (
            <div className="dashboard-wrapper">
                <p>Not authorized. You must log in as a Company Seller.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Seller Panel</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>
                        Manage {profile ? profile.companyName : 'your company'} profile and product line.
                    </p>
                </div>
                {profile && (
                    <span className={`status-badge ${profile.isVerified ? 'verified' : 'pending'}`}>
                        {profile.isVerified ? 'Verified Seller' : 'Verification Pending'}
                    </span>
                )}
            </div>

            <div className="dashboard-nav-tabs">
                <button 
                    className={`dashboard-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    My Products
                </button>
                <button 
                    className={`dashboard-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Fulfillment Orders
                </button>
                <button 
                    className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Company Profile
                </button>
                <button 
                    className={`dashboard-tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chats')}
                >
                    Customer Chats
                </button>
            </div>

            {message && <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border-color)', fontSize: '14px' }}>{message}</div>}

            {/* Seller Analytics Section */}
            {analytics && (
                <div style={{ marginBottom: '40px' }}>
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        <div className="stat-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
                            <span className="stat-title" style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Total Earnings</span>
                            <div className="stat-number" style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: '#2ecc71', fontWeight: '500' }}>
                                ${analytics.totalRevenue.toFixed(2)}
                            </div>
                        </div>
                        <div className="stat-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
                            <span className="stat-title" style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Fulfillment Orders</span>
                            <div className="stat-number" style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                {analytics.totalOrders}
                            </div>
                        </div>
                        <div className="stat-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
                            <span className="stat-title" style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Items Sold</span>
                            <div className="stat-number" style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                {analytics.totalItemsSold}
                            </div>
                        </div>
                        <div className="stat-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
                            <span className="stat-title" style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Active Catalog</span>
                            <div className="stat-number" style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                {analytics.totalProducts} products
                            </div>
                        </div>
                    </div>

                    {/* SVG Chart */}
                    <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 className="serif-heading" style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Monthly Revenue Summary</h3>
                        
                        <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                            <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Grid lines */}
                                <line x1="50" y1="30" x2="550" y2="30" stroke="var(--border-color)" strokeDasharray="4 4" />
                                <line x1="50" y1="80" x2="550" y2="80" stroke="var(--border-color)" strokeDasharray="4 4" />
                                <line x1="50" y1="130" x2="550" y2="130" stroke="var(--border-color)" strokeDasharray="4 4" />
                                <line x1="50" y1="170" x2="550" y2="170" stroke="var(--border-color)" />

                                {/* Render monthly bars */}
                                {analytics.salesData.map((data, idx) => {
                                    const maxVal = Math.max(100, ...analytics.salesData.map(s => s.revenue));
                                    const barHeight = (data.revenue / maxVal) * 120;
                                    const x = 80 + idx * 80;
                                    const y = 170 - barHeight;

                                    return (
                                        <g key={idx}>
                                            <rect 
                                                x={x} 
                                                y={y} 
                                                width="40" 
                                                height={barHeight} 
                                                fill="var(--text-primary)" 
                                                style={{ transition: 'all 0.5s ease' }} 
                                            />
                                            <text 
                                                x={x + 20} 
                                                y={y - 8} 
                                                textAnchor="middle" 
                                                style={{ fontSize: '10px', fill: 'var(--text-primary)', fontWeight: '600' }}
                                            >
                                                ${data.revenue.toFixed(0)}
                                            </text>
                                            <text 
                                                x={x + 20} 
                                                y="188" 
                                                textAnchor="middle" 
                                                style={{ fontSize: '11px', fill: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                            >
                                                {data.month}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="dashboard-content-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 className="serif-heading" style={{ fontSize: '22px' }}>Inventory Items</h2>
                        <button className="btn-primary" onClick={() => setShowAddProduct(!showAddProduct)}>
                            {showAddProduct ? 'Cancel' : 'Add New Product'}
                        </button>
                    </div>

                    {showAddProduct && (
                        <form onSubmit={handleProductSubmit} style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid var(--border-color)' }}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Product Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        required 
                                        value={productData.name} 
                                        onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Home Decor, Apparel"
                                        className="form-input" 
                                        required 
                                        value={productData.category} 
                                        onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Price (USD)</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        required 
                                        value={productData.price} 
                                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock Quantity</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        required 
                                        value={productData.stock} 
                                        onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="form-input" 
                                    style={{ height: '100px', resize: 'vertical' }}
                                    required 
                                    value={productData.description} 
                                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Product Image</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    required
                                    onChange={(e) => setProductImage(e.target.files[0])}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Upload Product</button>
                        </form>
                    )}

                    <div className="dashboard-table-wrapper">
                        {loading ? <p>Loading Products...</p> : products.length === 0 ? (
                            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No products uploaded yet.</p>
                        ) : (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(prod => (
                                        <tr key={prod._id}>
                                            <td>
                                                <img src={prod.imageUrl} alt={prod.name} className="table-image" />
                                            </td>
                                            <td style={{ fontWeight: '500' }}>{prod.name}</td>
                                            <td>{prod.category}</td>
                                            <td style={{ fontFamily: 'var(--font-serif)' }}>${prod.price}</td>
                                            <td>{prod.stock} items</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="dashboard-content-section">
                    <h2 className="serif-heading" style={{ fontSize: '22px', marginBottom: '24px' }}>Incoming Orders</h2>
                    
                    {ordersLoading ? (
                        <p>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No orders contain your products yet.</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div key={order._id} className="order-history-card" style={{ marginBottom: '24px' }}>
                                    <div className="order-card-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Order Number</span>
                                            <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>{order._id}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Ship To</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{order.address.fullName}</span>
                                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>{order.address.city}, {order.address.country}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Date Placed</span>
                                            <span style={{ fontSize: '13px' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Your Earnings</span>
                                            <span style={{ fontSize: '14px', fontFamily: 'var(--font-serif)', fontWeight: '600' }}>${order.sellerTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '0 24px' }}>
                                        {order.items.map((item) => (
                                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '40px', height: '50px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                                    <div>
                                                        <span style={{ display: 'block', fontWeight: '500' }}>{item.product.name}</span>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {item.qty} × ${item.price}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <span className={`status-badge ${item.status.toLowerCase()}`} style={{ fontSize: '10px' }}>
                                                        {item.status}
                                                    </span>
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleUpdateItemStatus(order._id, item.product._id, e.target.value)}
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            fontSize: '12px', 
                                                            border: '1px solid var(--border-color)', 
                                                            backgroundColor: 'var(--bg-primary)', 
                                                            color: 'var(--text-primary)' 
                                                        }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="dashboard-content-section">
                    <h2 className="serif-heading" style={{ fontSize: '22px', marginBottom: '24px' }}>Edit Company Details</h2>
                    
                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Company/Store Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    value={profileData.companyName} 
                                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    value={profileData.phone} 
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Store Location/Address</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    value={profileData.address} 
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Website (Optional)</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={profileData.website} 
                                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Company Description</label>
                            <textarea 
                                className="form-input" 
                                style={{ height: '100px', resize: 'vertical' }}
                                required 
                                value={profileData.description} 
                                onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Logo Image</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setLogoFile(e.target.files[0])}
                                />
                                {profile && profile.logoUrl && (
                                    <img src={profile.logoUrl} alt="logo preview" style={{ width: '60px', height: '60px', marginTop: '10px', border: '1px solid var(--border-color)' }} />
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Banner Image (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setBannerFile(e.target.files[0])}
                                />
                                {profile && profile.bannerUrl && (
                                    <img src={profile.bannerUrl} alt="banner preview" style={{ width: '120px', height: '60px', marginTop: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Save Changes</button>
                    </form>
                </div>
            )}

            {activeTab === 'chats' && (
                <div className="dashboard-content-section">
                    <SellerChat user={user} />
                </div>
            )}
        </div>
    );
};

export default CompanyDashboard;
