import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/login.css';
import { API_URL } from '../api';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                login(data);
                if (data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (data.role === 'company') {
                    navigate('/company/dashboard');
                } else {
                    navigate('/profile');
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Could not connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-image-side">
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text">
                    <span className="auth-brand">LIFESTYLE</span>
                    <h2 className="serif-heading">Simplicity is the ultimate sophistication.</h2>
                </div>
            </div>
            
            <div className="auth-form-side">
                <div className="auth-form-container">
                    <h1 className="serif-heading auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to access your curated dashboard</p>

                    {error && <div className="auth-error-banner">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer-links">
                        <p>Don't have an account? <Link to="/register" className="auth-redirect-link">Register Here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
