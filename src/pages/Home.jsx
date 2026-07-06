import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';
import '../styles/home.css';

const Home = () => {
    const { theme } = useContext(ThemeContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error("Failed to fetch products from backend:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Fallback/Mock Products based on the theme design if no products exist in the DB
    const lightMockProducts = [
        {
            _id: 'mock1',
            name: 'Ribbed Ceramic Vase',
            price: 48,
            category: 'Home Decor',
            imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600'
        },
        {
            _id: 'mock2',
            name: 'Essential Cotton Tee',
            price: 32,
            category: 'Apparel',
            imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600'
        },
        {
            _id: 'mock3',
            name: 'Minimalist Lounge Chair',
            price: 240,
            category: 'Furniture',
            imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600'
        }
    ];

    const darkMockProducts = [
        {
            _id: 'mock4',
            name: 'Charcoal Wool Cushion',
            price: 58,
            category: 'Home Decor',
            imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600'
        },
        {
            _id: 'mock5',
            name: 'Onyx Leather Jacket',
            price: 320,
            category: 'Apparel',
            imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600'
        },
        {
            _id: 'mock6',
            name: 'Matte Ceramic Vessel',
            price: 26,
            category: 'Home Decor',
            imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600'
        },
        {
            _id: 'mock7',
            name: 'Tactile Leather Sleeve',
            price: 78,
            category: 'Modern Utility',
            imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=600'
        }
    ];

    // Determine which products to display
    const displayProducts = products.length > 0 
        ? products 
        : (theme === 'light' ? lightMockProducts : darkMockProducts);

    // Dynamic styles based on theme
    const heroImage = theme === 'light'
        ? 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200' // Elegant model in light colors
        : 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200'; // Moody model in dark suit

    return (
        <div className="home-page-wrapper">
            {/* Hero Section */}
            <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-overlay"></div>
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-subtitle">
                            {theme === 'light' ? 'New Collection 2024' : 'Define Your Essence'}
                        </span>
                        <h1 className="hero-title serif-heading">
                            {theme === 'light' ? 'The Art of Essential Living.' : 'Define your essence.'}
                        </h1>
                        <p className="hero-desc">
                            {theme === 'light' 
                                ? 'Meticulously crafted pieces designed to bring balance, utility, and timeless design to your everyday rituals.'
                                : 'A curation of high-contrast, modern luxury essentials built for durability, strength, and premium style.'}
                        </p>
                        <Link to="/shop" className="btn-primary">
                            {theme === 'light' ? 'Shop New Arrivals' : 'Shop Now'}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured / Drop Section */}
            <section className="section-padding">
                <div className="container">
                    <div className="featured-header">
                        <div>
                            <h2 className="featured-title serif-heading">
                                {theme === 'light' ? 'Featured Pieces' : 'Coveted Pieces'}
                            </h2>
                            <p className="featured-sub">
                                {theme === 'light' 
                                    ? 'Meticulously crafted for enduring style.' 
                                    : 'Most coveted pieces from our recent drop.'}
                            </p>
                        </div>
                        <Link to="/shop" className="link-underline">
                            {theme === 'light' ? 'View All Collections' : 'View All Products'}
                        </Link>
                    </div>

                    <div className={`products-grid ${theme === 'light' ? 'cols-3' : 'cols-4'}`}>
                        {displayProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Editorial split section */}
            <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="container">
                    <div className="editorial-split">
                        {theme === 'light' ? (
                            <>
                                <div className="editorial-left">
                                    <div className="editorial-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600')` }}>
                                        <div className="editorial-card-overlay"></div>
                                        <div className="editorial-card-content">
                                            <h3 className="editorial-card-title serif-heading">The Sustainability Edit</h3>
                                            <Link to="/story" className="link-underline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>Read the story</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="editorial-right">
                                    <div className="box-light-grey">
                                        <h3 className="box-title serif-heading">Mastering the Minimal</h3>
                                        <p className="box-desc">Learn the core principles of minimalist interior design with our studio director.</p>
                                        <Link to="/studio" className="link-underline">Explore Studio</Link>
                                    </div>
                                    <div className="box-black">
                                        <h3 className="box-title serif-heading">Join the Circle.</h3>
                                        <p className="box-desc">Receive 10% off your first purchase and exclusive access to new drops.</p>
                                        <form className="newsletter-inline-form" onSubmit={(e) => e.preventDefault()}>
                                            <input type="email" placeholder="Email Address" className="newsletter-inline-input" required />
                                            <button type="submit" className="newsletter-inline-submit">Sign Up</button>
                                        </form>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="editorial-left">
                                    <div className="editorial-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600')` }}>
                                        <div className="editorial-card-overlay"></div>
                                        <div className="editorial-card-content">
                                            <h3 className="editorial-card-title serif-heading">The Sanctuary Series</h3>
                                            <Link to="/shop?category=decor" className="btn-primary" style={{ marginTop: '16px' }}>Shop Home Decor</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="editorial-right">
                                    <div className="editorial-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600')` }}>
                                        <div className="editorial-card-overlay"></div>
                                        <div className="editorial-card-content">
                                            <h3 className="editorial-card-title serif-heading">Wellness Rituals</h3>
                                            <Link to="/wellness" className="link-underline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>Explore</Link>
                                        </div>
                                    </div>
                                    <div className="editorial-card" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600')` }}>
                                        <div className="editorial-card-overlay"></div>
                                        <div className="editorial-card-content">
                                            <h3 className="editorial-card-title serif-heading">Modern Utility</h3>
                                            <Link to="/shop?category=tech" className="link-underline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>Shop Tech</Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Social Grid Section */}
            {theme === 'light' && (
                <section className="section-padding">
                    <div className="container social-section">
                        <h3 className="social-title">Follow the aesthetic @lifestyle</h3>
                        <div className="social-grid">
                            <div className="social-item">
                                <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400" alt="Instagram 1" className="social-img" />
                            </div>
                            <div className="social-item">
                                <img src="https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=400" alt="Instagram 2" className="social-img" />
                            </div>
                            <div className="social-item">
                                <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400" alt="Instagram 3" className="social-img" />
                            </div>
                            <div className="social-item">
                                <img src="https://images.unsplash.com/photo-1617806118233-18e1db207f62?q=80&w=400" alt="Instagram 4" className="social-img" />
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
