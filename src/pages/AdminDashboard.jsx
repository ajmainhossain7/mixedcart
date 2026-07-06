import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('companies');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const fetchAdminData = async () => {
            try {
                // Fetch stats
                const statsRes = await fetch('http://localhost:5000/api/analytics', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch company profiles
                const companyRes = await fetch('http://localhost:5000/api/company/admin/profiles', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (companyRes.ok) {
                    const companyData = await companyRes.json();
                    setCompanies(companyData);
                }

                // Fetch orders
                const ordersRes = await fetch('http://localhost:5000/api/orders', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData);
                }
            } catch (error) {
                console.error('Error fetching admin dashboard details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [user]);

    const handleVerifyCompany = async (profileId, verifyState) => {
        setMessage('');
        try {
            const res = await fetch(`http://localhost:5000/api/company/admin/profiles/${profileId}/verify`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ isVerified: verifyState })
            });

            if (res.ok) {
                const responseData = await res.json();
                setCompanies(companies.map(comp => comp._id === profileId ? { ...comp, isVerified: verifyState } : comp));
                setMessage(responseData.message || 'Verification status updated.');
                
                // Refresh stats
                const statsRes = await fetch('http://localhost:5000/api/analytics', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } else {
                setMessage('Failed to update company verification status.');
            }
        } catch (error) {
            setMessage('An error occurred during verification.');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setMessage('');
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setOrders(orders.map(ord => ord._id === orderId ? { ...ord, status: newStatus } : ord));
                setMessage('Order status updated successfully.');
            } else {
                setMessage('Failed to update order status.');
            }
        } catch (error) {
            setMessage('An error occurred during order status update.');
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="dashboard-wrapper">
                <p>Not authorized. You must log in as an Administrator.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>
                        Overlook platform stats, approve registered companies, and manage product orders.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-title">Platform Revenue</span>
                        <div className="stat-number" style={{ color: '#2ecc71' }}>${stats.totalRevenue}</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Total Orders</span>
                        <div className="stat-number">{stats.totalOrders}</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Products Live</span>
                        <div className="stat-number">{stats.totalProducts}</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Sellers / Verified</span>
                        <div className="stat-number">{stats.totalCompanies} / {stats.verifiedCompanies}</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Active Customers</span>
                        <div className="stat-number">{stats.totalUsers}</div>
                    </div>
                </div>
            )}

            {message && <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border-color)', fontSize: '14px' }}>{message}</div>}

            <div className="dashboard-nav-tabs">
                <button 
                    className={`dashboard-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('companies')}
                >
                    Seller Approvals
                </button>
                <button 
                    className={`dashboard-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Order Management
                </button>
            </div>

            {activeTab === 'companies' ? (
                <div className="dashboard-content-section">
                    <h2 className="serif-heading" style={{ fontSize: '22px', marginBottom: '24px' }}>Registered Sellers</h2>
                    
                    <div className="dashboard-table-wrapper">
                        {loading ? <p>Loading companies...</p> : companies.length === 0 ? (
                            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No seller profiles found.</p>
                        ) : (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Logo</th>
                                        <th>Store Details</th>
                                        <th>Contact Details</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map(comp => (
                                        <tr key={comp._id}>
                                            <td>
                                                <img src={comp.logoUrl} alt={comp.companyName} className="table-image" style={{ borderRadius: '50%' }} />
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{comp.companyName}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', maxWidth: '300px' }}>{comp.description}</div>
                                            </td>
                                            <td>
                                                <div>{comp.address}</div>
                                                <div style={{ color: 'var(--text-light)', fontSize: '13px' }}>{comp.phone}</div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${comp.isVerified ? 'verified' : 'pending'}`}>
                                                    {comp.isVerified ? 'Approved' : 'Pending Approval'}
                                                </span>
                                            </td>
                                            <td>
                                                {comp.isVerified ? (
                                                    <button 
                                                        className="btn-secondary" 
                                                        style={{ padding: '8px 16px', fontSize: '10px' }}
                                                        onClick={() => handleVerifyCompany(comp._id, false)}
                                                    >
                                                        Revoke
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="btn-primary" 
                                                        style={{ padding: '8px 16px', fontSize: '10px' }}
                                                        onClick={() => handleVerifyCompany(comp._id, true)}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                <div className="dashboard-content-section">
                    <h2 className="serif-heading" style={{ fontSize: '22px', marginBottom: '24px' }}>Platform Orders</h2>

                    <div className="dashboard-table-wrapper">
                        {loading ? <p>Loading orders...</p> : orders.length === 0 ? (
                            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No orders placed on the platform.</p>
                        ) : (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Update Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(ord => (
                                        <tr key={ord._id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{ord._id}</td>
                                            <td>
                                                <div style={{ fontWeight: '500' }}>{ord.user ? ord.user.name : 'Unknown User'}</div>
                                                <div style={{ color: 'var(--text-light)', fontSize: '12px' }}>{ord.address ? `${ord.address.city}, ${ord.address.country}` : ''}</div>
                                            </td>
                                            <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                                            <td style={{ fontFamily: 'var(--font-serif)', fontWeight: '500' }}>${ord.totalAmount}</td>
                                            <td>
                                                <span style={{ 
                                                    textTransform: 'uppercase', 
                                                    fontSize: '11px', 
                                                    fontWeight: '700',
                                                    color: ord.status === 'Delivered' ? '#27ae60' : ord.status === 'Pending' ? '#e74c3c' : '#f39c12'
                                                }}>
                                                    {ord.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select 
                                                    value={ord.status} 
                                                    onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        border: '1px solid var(--border-color)',
                                                        backgroundColor: 'var(--bg-primary)',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
