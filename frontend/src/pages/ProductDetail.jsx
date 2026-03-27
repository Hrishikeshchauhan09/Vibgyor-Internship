import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    try {
      await API.post('/cart', { product_id: product.product_id, quantity: qty });
      setMsg('Added to cart! 🛒');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed.');
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
    </div>
  );
};

export default ProductDetail;
