import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <Link to="/" className="footer-logo">LIFESTYLE</Link>
                        <p className="footer-desc">
                            Meticulously crafted essentials for the modern home and body. Curated with endurance and minimalism in mind.
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="footer-social-icon" aria-label="Instagram">
                                IG
                            </a>
                            <a href="#" className="footer-social-icon" aria-label="Pinterest">
                                PT
                            </a>
                            <a href="#" className="footer-social-icon" aria-label="Facebook">
                                FB
                            </a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Collections</h4>
                        <ul className="footer-links">
                            <li><Link to="/shop" className="footer-link">New Arrivals</Link></li>
                            <li><Link to="/shop?category=home" className="footer-link">Home Decor</Link></li>
                            <li><Link to="/shop?category=apparel" className="footer-link">Apparel</Link></li>
                            <li><Link to="/shop?category=essentials" className="footer-link">Essentials</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Information</h4>
                        <ul className="footer-links">
                            <li><a href="#" className="footer-link">Our Story</a></li>
                            <li><a href="#" className="footer-link">Sustainability</a></li>
                            <li><a href="#" className="footer-link">Shipping & Returns</a></li>
                            <li><a href="#" className="footer-link">Contact</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Newsletter</h4>
                        <p className="footer-newsletter-text">
                            Join the circle. Subscribe to receive updates, access to exclusive drops, and more.
                        </p>
                        <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Your Email Address" 
                                className="footer-newsletter-input" 
                                required
                            />
                            <button type="submit" className="footer-newsletter-submit">Sign Up</button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} LIFESTYLE. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#" className="footer-link">Privacy Policy</a>
                        <a href="#" className="footer-link">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
