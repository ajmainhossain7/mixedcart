import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    MixedCart
                </Link>
            </div>
            <ul className="navbar-menu">
                <li className="navbar-item">
                    <Link to="/" className="navbar-link">
                        Home
                    </Link>
                </li>
                <li className="navbar-item">
                    <Link to="/shop" className="navbar-link">
                        Shop
                    </Link>
                </li>
                <li className="navbar-item">
                    <Link to="/cart" className="navbar-link">
                        Cart
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;