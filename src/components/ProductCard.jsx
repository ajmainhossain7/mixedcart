import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/product.css";

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <button className="product-wishlist-btn" aria-label="Add to wishlist">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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