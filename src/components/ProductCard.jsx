import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "../styles/product.css";

const ProductCard = ({ product }) => {
    const { user, wishlist, toggleWishlist } = useContext(AuthContext);

    const isWishlisted = wishlist.includes(product._id);

    const handleWishlistClick = (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to save items to your wishlist.');
            return;
        }
        toggleWishlist(product._id);
    };

    return (
        <div className="product-card">
            <button 
                onClick={handleWishlistClick}
                className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`} 
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
                <svg width="15" height="15" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
            <Link to={`/product/${product._id}`} className="product-image-wrapper">
                <img src={product.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600'} alt={product.name} className="product-image" />
            </Link>
            <div className="product-info">
                <span className="product-category">{product.category || "Essentials"}</span>
                <Link to={`/product/${product._id}`}>
                    <h3 className="product-name">{product.name}</h3>
                </Link>
                
                <div className="product-rating-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', height: '16px' }}>
                    <div style={{ color: '#F39C12', fontSize: '12px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < Math.round(product.rating || 0) ? '★' : '☆'}</span>
                        ))}
                    </div>
                    {product.numReviews > 0 ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>({product.numReviews})</span>
                    ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-light)', fontStyle: 'italic' }}>No reviews</span>
                    )}
                </div>

                <div className="product-price-btn-wrapper">
                    <span className="product-price">${product.price}</span>
                    <Link to={`/product/${product._id}`} className="product-action-link">
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;