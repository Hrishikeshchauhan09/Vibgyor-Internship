import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, cRes] = await Promise.all([API.get('/products'), API.get('/categories')]);
        setProducts(pRes.data);
        setCategories(cRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        const params = selectedCat ? `?category_id=${selectedCat}` : '';
        const { data } = await API.get(`/products${params}`);
        setProducts(data);
      } catch (err) { console.error(err); }
    };
    fetchFiltered();
  }, [selectedCat]);

  const addToCart = async (productId) => {
    try {
      await API.post('/cart', { product_id: productId, quantity: 1 });
      setCartMsg('Item added to cart! 🛒');
      setTimeout(() => setCartMsg(''), 2500);
    } catch (err) {
      setCartMsg(err.response?.data?.message || 'Failed to add to cart.');
      setTimeout(() => setCartMsg(''), 2500);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{filtered.length} product{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <Link to="/cart" className="btn btn-primary">🛒 View Cart</Link>
      </div>

      {cartMsg && <div className="alert alert-success">{cartMsg}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          id="product-search"
          type="text"
          className="form-control"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
        <select
          id="category-filter"
          className="form-control"
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>No products found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map((product) => (
            <div className="product-card" key={product.product_id}>
              <div className="product-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '📦'}
              </div>
              <div className="product-info">
                <div className="product-category">{product.category_name || 'Uncategorized'}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-price">₹{parseFloat(product.price).toFixed(2)}</div>
                <div className="product-stock" style={{ marginBottom: '1rem' }}>
                  {product.stock > 0
                    ? <span style={{ color: 'var(--success)' }}>✓ In Stock ({product.stock})</span>
                    : <span style={{ color: 'var(--danger)' }}>✗ Out of Stock</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/products/${product.product_id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Details</Link>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => addToCart(product.product_id)}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
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

export default Products;
