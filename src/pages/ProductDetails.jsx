import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
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
    const { user } = useContext(AuthContext);
    
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);

    // Review Form States
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');

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

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setReviewError('');
        setReviewSuccess('');

        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            const data = await res.json();
            if (res.ok) {
                setReviewSuccess('Review submitted successfully!');
                setProduct(data.product);
                setComment('');
                setRating(5);
            } else {
                setReviewError(data.message || 'Failed to submit review.');
            }
        } catch (err) {
            setReviewError('Could not connect to server.');
        } finally {
            setSubmitting(false);
        }
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

                    {(!user || (product.seller && user._id.toString() !== product.seller.toString())) && (
                        <button 
                            onClick={() => {
                                if (!product.seller) return;
                                window.dispatchEvent(new CustomEvent('open_chat_with_seller', { 
                                    detail: { sellerId: product.seller } 
                                }));
                            }} 
                            className="btn-secondary" 
                            style={{ 
                                marginTop: '16px', 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px',
                                padding: '12px'
                            }}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.084.29.128.597.128.916 0 3.737-3.722 6.75-8.318 6.75-1.077 0-2.119-.166-3.084-.469l-3.327 2.018c-.43.26-.99-.071-.99-.575v-1.748c-1.39-1.282-2.288-3.003-2.288-4.912 0-3.737 3.722-6.75 8.318-6.75 4.596 0 8.318 3.013 8.318 6.75zm-8.25-.975v.008H12v-.008zm-3 0v.008h.008v-.008zm6 0v.008h.008v-.008z" />
                            </svg>
                            Chat with Seller
                        </button>
                    )}

                    <div className="details-shipping-info">
                        <p>✓ Order ships in 1-3 business days.</p>
                        <p>✓ Free domestic shipping on orders over $150.</p>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="product-reviews-section">
                <h2 className="serif-heading reviews-section-title">Customer Reviews ({product.reviews ? product.reviews.length : 0})</h2>
                
                <div className="reviews-layout">
                    {/* Reviews List */}
                    <div className="reviews-list-column">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review) => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <span className="review-author">{review.name}</span>
                                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="review-rating">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                                        ))}
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p className="no-reviews-text">No reviews yet for this product. Be the first to leave a review!</p>
                        )}
                    </div>

                    {/* Review Form */}
                    {user ? (
                        <div className="review-form-column">
                            <h3 className="serif-heading review-form-title">Write a Review</h3>
                            {reviewError && <div className="review-error-message">{reviewError}</div>}
                            {reviewSuccess && <div className="review-success-message">{reviewSuccess}</div>}
                            
                            <form onSubmit={handleReviewSubmit} className="review-form">
                                <div className="form-group">
                                    <label htmlFor="rating">Rating</label>
                                    <select
                                        id="rating"
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        className="form-input select-input"
                                        required
                                    >
                                        <option value="5">5 Stars — Excellent</option>
                                        <option value="4">4 Stars — Good</option>
                                        <option value="3">3 Stars — Average</option>
                                        <option value="2">2 Stars — Poor</option>
                                        <option value="1">1 Star — Very Poor</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="comment">Comment</label>
                                    <textarea
                                        id="comment"
                                        rows="4"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="form-input textarea-input"
                                        placeholder="Share your thoughts about this product..."
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-primary review-submit-btn" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="review-login-prompt">
                            <p>Please <Link to="/login" className="review-login-link">login</Link> to write a review.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
