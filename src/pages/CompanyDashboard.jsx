import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

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
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

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
                    className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Company Profile
                </button>
            </div>

            {message && <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border-color)', fontSize: '14px' }}>{message}</div>}

            {activeTab === 'products' ? (
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
            ) : (
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
        </div>
    );
};

export default CompanyDashboard;
