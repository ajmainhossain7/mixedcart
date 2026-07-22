import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/register.css';
import { API_URL } from '../api';

const Register = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setSuccessMsg('Registration successful! A welcome OTP email has been sent.');
                setTimeout(() => {
                    login(data);
                    if (data.role === 'company') {
                        navigate('/company/dashboard');
                    } else {
                        navigate('/profile');
                    }
                }, 2000);
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Could not connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-image-side register-image-side">
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text">
                    <span className="auth-brand">LIFESTYLE</span>
                    <h2 className="serif-heading">Design is not just what it looks like and feels like. Design is how it works.</h2>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-form-container">
                    <h1 className="serif-heading auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join us to experience premium lifestyle collection</p>

                    {error && <div className="auth-error-banner">{error}</div>}
                    {successMsg && <div className="auth-success-banner">{successMsg}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="John Doe"
                                required
                            />
                        </div>

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

                        <div className="form-group">
                            <label htmlFor="role">Account Type</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-input select-input"
                            >
                                <option value="user">Customer</option>
                                <option value="company">Seller / Company</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer-links">
                        <p>Already have an account? <Link to="/login" className="auth-redirect-link">Login Here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
