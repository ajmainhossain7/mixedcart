import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/productDetails.css';

// Mock catalog for lookup if DB does not have it
const mockProducts = [
    { _id: 'mock1', name: 'Ribbed Ceramic Vase', price: 48, category: 'Home Decor', description: 'Handcrafted ceramic vase with vertical ribbing and a soft matte finish. A perfect statement piece for minimalist styling.', imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600' },
    { _id: 'mock2', name: 'Essential Cotton Tee', price: 32, category: 'Apparel', description: 'Classic fit tee made from 100% organic cotton for everyday luxury. Heavyweight knit with durable side seam structure.', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' },
    { _id: 'mock3', name: 'Minimalist Lounge Chair', price: 240, category: 'Furniture', description: 'Sleek wooden frame lounge chair with high-density foam cushions. Fully upholstered in heavy textured linen.', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600' },
    { _id: 'mock4', name: 'Charcoal Wool Cushion', price: 58, category: 'Home Decor', description: 'Cozy throw cushion cover woven from premium Australian wool. Hand-finished details with invisible zipper closure.', imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600' },
    { _id: 'mock5', name: 'Onyx Leather Jacket', price: 320, category: 'Apparel', description: 'Hand-burnished black leather jacket with premium metal zippers. Slim fit profile with fully lined quilted interior.', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600' },
    { _id: 'mock6', name: 'Matte Ceramic Vessel', price: 26, category: 'Home Decor', description: 'Earth-toned ceramic container, perfect for storage or floral styling. Food safe glazing inside.', imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600' },
    { _id: 'mock7', name: 'Tactile Leather Sleeve', price: 78, category: 'Modern Utility', description: 'Full-grain leather laptop sleeve lined with protective soft microfiber. Fits modern 13-14 inch laptops.', imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=600' },
    { _id: 'mock8', name: 'Organic Herbal Wellness Tea', price: 18, category: 'Wellness', description: 'Loose-leaf blend of chamomile, peppermint, and lavender for calming rituals. Sustainably sourced.', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600' }
];

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useContext(CartContext);
    
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                } else {
                    const mock = mockProducts.find(p => p._id === id);
                    if (mock) {
                        setProduct(mock);
                    } else {
                        setProduct(mockProducts[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
                const mock = mockProducts.find(p => p._id === id);
                setProduct(mock || mockProducts[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return <div className="product-details-loading container section-padding">Loading details...</div>;
    if (!product) return <div className="product-details-error container section-padding">Product not found.</div>;

    return (
        <div className="product-details-container container section-padding">
            <Link to="/shop" className="back-link">
                ← Back to Shop
            </Link>

            <div className="product-details-layout">
                {/* Product Image Column */}
                <div className="product-details-image-wrapper">
                    <img src={product.imageUrl} alt={product.name} className="product-details-image" />
                </div>

                {/* Product Specs Column */}
                <div className="product-details-info">
                    <span className="details-category">{product.category}</span>
                    <h1 className="serif-heading details-name">{product.name}</h1>
                    <span className="details-price">${product.price}</span>
                    
                    <p className="details-description">{product.description || "No description provided."}</p>

                    <div className="details-divider"></div>

                    <div className="details-action-row">
                        <div className="details-qty-counter">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="details-qty-btn">—</button>
                            <span className="details-qty-value">{qty}</span>
                            <button onClick={() => setQty(qty + 1)} className="details-qty-btn">+</button>
                        </div>

                        <button onClick={handleAddToCart} className="btn-primary details-add-btn">
                            {added ? 'Added to Bag' : 'Add to Bag'}
                        </button>
                    </div>

                    <div className="details-shipping-info">
                        <p>✓ Order ships in 1-3 business days.</p>
                        <p>✓ Free domestic shipping on orders over $150.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
