import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/navbar.css";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <nav className="navbar">
            <div className="navbar-container-wrapper">
                <Link to="/" className="navbar-logo">
                    <img src="https://i.ibb.co/0j1Z5kM/logo.png" alt="Logo" className="navbar-logo-image" />
                    LIFESTYLE
                </Link>

                <ul className="navbar-links">
                    <li className="navbar-item">
                        <NavLink to="/shop" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>Shop</NavLink>
                    </li>

                    {user && user.role === 'admin' && (
                        <li className="navbar-item">
                            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>Admin</NavLink>
                        </li>
                    )}

                    {user && user.role === 'company' && (
                        <li className="navbar-item">
                            <NavLink to="/company/dashboard" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>Seller Panel</NavLink>
                        </li>
                    )}
                    {/* Cart Icon (Left side of User Icon) */}
                    <li className="navbar-item">
                        <NavLink to="/cart" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"} aria-label="Cart">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="navbar-icon">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </NavLink>
                    </li>

                    {/* User Icon */}
                    {user ? (
                        <>
                            <li className="navbar-item">
                                <NavLink to="/profile" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"} aria-label="Profile">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="navbar-icon">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </NavLink>
                            </li>
                            <li className="navbar-item">
                                <button onClick={logout} className="navbar-link-btn">Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="navbar-item">
                                <NavLink to="/login" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"} aria-label="Login">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="navbar-icon">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </NavLink>
                            </li>
                            <li className="navbar-item">
                                <NavLink to="/register" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>Register</NavLink>
                            </li>
                        </>
                    )}

                    <li className="navbar-item">
                        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
                            {theme === 'light' ? (
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;