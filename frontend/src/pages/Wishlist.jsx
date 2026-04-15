import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/wishlist');
      setWishlist(data);
    } catch (err) {
      console.error(err);
      setMsg('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (wishlistId) => {
    try {
      await API.delete(`/wishlist/${wishlistId}`);
      setWishlist(wishlist.filter(item => item.wishlist_id !== wishlistId));
      setMsg('Item removed from wishlist.');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg('Failed to remove item.');
    }
  };

  const addToCart = async (productId) => {
    try {
      await API.post('/cart', { product_id: productId, quantity: 1 });
      setMsg('Item added to cart! 🛒');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add to cart.');
      setTimeout(() => setMsg(''), 2500);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Wishlist ❤️</h1>
          <p className="page-subtitle">Save your favorite items for later.</p>
        </div>
        <Link to="/products" className="btn btn-secondary">← Continue Shopping</Link>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <p>Your wishlist is currently empty.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map((item) => (
            <div className="product-card" key={item.wishlist_id}>
              <div className="product-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '📦'}
              </div>
              <div className="product-info">
                <div className="product-name">{item.name}</div>
                <div className="product-price">₹{parseFloat(item.price).toFixed(2)}</div>
                <div className="product-stock" style={{ marginBottom: '1rem' }}>
                  {item.stock > 0
                    ? <span style={{ color: 'var(--success)' }}>✓ In Stock ({item.stock})</span>
                    : <span style={{ color: 'var(--danger)' }}>✗ Out of Stock</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => addToCart(item.product_id)}
                    disabled={item.stock === 0}
                  >
                    Add to Cart
                  </button>
                </div>
                <div style={{ display: 'flex' }}>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, justifyContent: 'center', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }}
                    onClick={() => removeFromWishlist(item.wishlist_id)}
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
