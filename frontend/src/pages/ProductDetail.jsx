import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prodData } = await API.get(`/products/${id}`);
        setProduct(prodData);
        
        const { data: revData } = await API.get(`/reviews/product/${id}`);
        setReviews(revData);
      } catch (err) {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const addToCart = async () => {
    try {
      await API.post('/cart', { product_id: product.product_id, quantity: qty });
      setMsg('Added to cart! 🛒');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed.');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await API.post(`/reviews/${id}`, { rating, review_text: reviewText });
      setMsg('Review submitted successfully! It is pending admin approval. ⭐');
      setRating(5);
      setReviewText('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;
  if (!product) return null;

  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>← Back</button>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontSize: '5rem' }}>
          {product.image_url ? <img src={product.image_url} alt={product.name} style={{ maxHeight: '300px', borderRadius: 'var(--radius)' }} /> : '📦'}
        </div>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>{product.category_name || 'Uncategorized'}</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.75rem' }}>{product.name}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{product.description || 'No description available.'}</p>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>₹{parseFloat(product.price).toFixed(2)}</div>
          <div style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', marginBottom: '1.5rem', fontWeight: '600' }}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Quantity:</label>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span style={{ fontWeight: '700', minWidth: '2rem', textAlign: 'center' }}>{qty}</span>
              <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={addToCart}
            disabled={product.stock === 0}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Customer Reviews</h2>
        
        {reviews.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
            {reviews.map(rev => (
              <div key={rev.review_id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '600' }}>{rev.customer_name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ color: 'var(--warning)', letterSpacing: '2px', marginBottom: '0.5rem' }}>
                  {'⭐'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>{rev.review_text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontStyle: 'italic' }}>No reviews yet for this product. Be the first to review!</p>
        )}

        {/* Add Review Form */}
        <div className="card" style={{ background: 'var(--bg-light)', border: 'none' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Write a Review</h3>
          {user ? (
            <form onSubmit={submitReview}>
              <div className="form-group">
                <label>Rating</label>
                <select 
                  className="form-control" 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{ width: '150px' }}
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Good</option>
                  <option value="3">3 Stars - Average</option>
                  <option value="2">2 Stars - Poor</option>
                  <option value="1">1 Star - Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  value={reviewText} 
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us what you think about this product..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>You must be logged in to leave a review. <a href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here</a></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
