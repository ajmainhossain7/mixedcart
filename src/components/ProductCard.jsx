import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/product.css";

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-link">
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price}</p>
                    <Link to={`/product/${product._id}`} className="product-button">
                        View Details
                    </Link>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;