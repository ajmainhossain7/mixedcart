import React from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/navbar.css";
import { useSelector } from "react-redux";

const Navbar = () => {
    const {user, logout } = React.useContext(AuthContext);
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
             <img src="https://i.ibb.co/0j1Z5kM/logo.png" alt="Logo" className="navbar-logo-image" />MixedCart
                </Link>
            </div>
            <ul className="navbar-links">
                <li className="navbar-item">
                    <Link to="/shop" className="navbar-link">Shop</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/cart" className="navbar-link">Cart</Link>
                </li>
                {user ? (
                    <>
                        <li className="navbar-item">
                            <Link to="/profile" className="navbar-link">Profile</Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li className="navbar-item">
                            <Link to="/login" className="navbar-link">Login</Link>
                        </li>
                        <li className="navbar-item">
                            <Link to="/register" className="navbar-link">Register</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;