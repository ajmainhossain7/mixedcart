import React, { useState, useEffect, useContext } from 'react';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import '../styles/shop.css';
import { API_URL } from '../api';

// Combine mock products for rich fallback
const mockProducts = [
    { _id: 'mock1', name: 'Ribbed Ceramic Vase', price: 48, category: 'Home Decor', description: 'Handcrafted ceramic vase with vertical ribbing and a soft matte finish.', imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600' },
    { _id: 'mock2', name: 'Essential Cotton Tee', price: 32, category: 'Apparel', description: 'Classic fit tee made from 100% organic cotton for everyday luxury.', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' },
    { _id: 'mock3', name: 'Minimalist Lounge Chair', price: 240, category: 'Furniture', description: 'Sleek wooden frame lounge chair with high-density foam cushions.', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600' },
    { _id: 'mock4', name: 'Charcoal Wool Cushion', price: 58, category: 'Home Decor', description: 'Cozy throw cushion cover woven from premium Australian wool.', imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600' },
    { _id: 'mock5', name: 'Onyx Leather Jacket', price: 320, category: 'Apparel', description: 'Hand-burnished black leather jacket with premium metal zippers.', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600' },
    { _id: 'mock6', name: 'Matte Ceramic Vessel', price: 26, category: 'Home Decor', description: 'Earth-toned ceramic container, perfect for storage or floral styling.', imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600' },
    { _id: 'mock7', name: 'Tactile Leather Sleeve', price: 78, category: 'Modern Utility', description: 'Full-grain leather laptop sleeve lined with protective soft microfiber.', imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=600' },
    { _id: 'mock8', name: 'Organic Herbal Wellness Tea', price: 18, category: 'Wellness', description: 'Loose-leaf blend of chamomile, peppermint, and lavender for calming rituals.', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600' }
];

const Shop = () => {
    const { addToCart } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOption, setSortOption] = useState('Featured');
    
    // Advanced filters
    const [showFilters, setShowFilters] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('All');
    const [inStockOnly, setInStockOnly] = useState(false);

    const categories = ['All', 'Apparel', 'Home Decor', 'Furniture', 'Wellness', 'Modern Utility'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products`);
                if (res.ok) {
                    const data = await res.json();
                    // Make sure it is an array and not empty
                    if (Array.isArray(data) && data.length > 0) {
                        setProducts(data);
                    } else {
                        setProducts(mockProducts);
                    }
                } else {
                    setProducts(mockProducts);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setProducts(mockProducts);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Apply filtering & sorting
    useEffect(() => {
        let result = [...products];

        // Search filter
        if (searchQuery.trim() !== '') {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            result = result.filter(product => product.category === selectedCategory);
        }

        // Price Min filter
        if (minPrice !== '') {
            result = result.filter(product => product.price >= Number(minPrice));
        }

        // Price Max filter
        if (maxPrice !== '') {
            result = result.filter(product => product.price <= Number(maxPrice));
        }

        // Ratings filter
        if (minRating !== 'All') {
            result = result.filter(product => (product.rating || 0) >= Number(minRating));
        }

        // Stock availability filter
        if (inStockOnly) {
            result = result.filter(product => (product.stock || 0) > 0);
        }

        // Sort filter
        if (sortOption === 'Price: Low to High') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'Price: High to Low') {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(result);
    }, [products, searchQuery, selectedCategory, sortOption, minPrice, maxPrice, minRating, inStockOnly]);

    return (
        <div className="shop-page-container container section-padding">
            <header className="shop-header">
                <h1 className="serif-heading shop-title">Curated Collection</h1>
                <p className="shop-subtitle">Functional beauty for modern living</p>
            </header>

            {/* Filter Toolbar */}
            <div className="shop-toolbar">
                <div className="search-bar-wrapper">
                    <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`btn-secondary filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>

                    <div className="sort-wrapper">
                        <label htmlFor="sort">Sort By</label>
                        <select
                            id="sort"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="form-input select-input sort-select"
                        >
                            <option value="Featured">Featured</option>
                            <option value="Price: Low to High">Price: Low to High</option>
                            <option value="Price: High to Low">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className="shop-filters-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--text-secondary)' }}>Price Range</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={minPrice} 
                                onChange={(e) => setMinPrice(e.target.value)} 
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px' }} 
                            />
                            <span style={{ color: 'var(--text-light)' }}>—</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={maxPrice} 
                                onChange={(e) => setMaxPrice(e.target.value)} 
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px' }} 
                            />
                        </div>
                    </div>

                    <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--text-secondary)' }}>Minimum Rating</span>
                        <select 
                            value={minRating} 
                            onChange={(e) => setMinRating(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px' }}
                        >
                            <option value="All">All Ratings</option>
                            <option value="4">4★ & Above</option>
                            <option value="3">3★ & Above</option>
                            <option value="2">2★ & Above</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <input 
                                type="checkbox" 
                                checked={inStockOnly} 
                                onChange={(e) => setInStockOnly(e.target.checked)} 
                                style={{ width: '16px', height: '16px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                            />
                            In Stock Only
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '20px', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => {
                                setMinPrice('');
                                setMaxPrice('');
                                setMinRating('All');
                                setInStockOnly(false);
                            }}
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '11px' }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Category Tabs */}
            <div className="category-tabs">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category-tab-btn ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="shop-loading">Loading Collection...</div>
            ) : filteredProducts.length > 0 ? (
                <div className="product-grid">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="shop-card-wrapper">
                            <ProductCard product={product} />
                            <button 
                                onClick={() => addToCart(product, 1)} 
                                className="shop-add-to-cart-btn btn-secondary"
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="shop-no-results">
                    <h3 className="serif-heading">No items match your search.</h3>
                    <p>Try checking your spelling or choosing a different category.</p>
                </div>
            )}
        </div>
    );
};

export default Shop;
