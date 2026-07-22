import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [wishlist, setWishlist] = useState([]);

    const fetchWishlist = async (token) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data.map(item => item._id || item));
            }
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        fetchWishlist(userData.token);
    };

    const logout = () => {
        setUser(null);
        setWishlist([]);
        localStorage.removeItem('user');
    };

    const toggleWishlist = async (productId) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/auth/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ productId })
            });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data.wishlist);
            }
        } catch (err) {
            console.error('Error toggling wishlist:', err);
        }
    };

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            fetchWishlist(parsed.token);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, wishlist, toggleWishlist }}>
            {children}
        </AuthContext.Provider>
    );
};