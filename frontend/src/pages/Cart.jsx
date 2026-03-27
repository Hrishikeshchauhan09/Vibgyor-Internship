import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await API.get('/cart');
      setItems(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (cartId, qty) => {
    if (qty < 1) return;
    await API.put(`/cart/${cartId}`, { quantity: qty });
    fetchCart();
  };

  const removeItem = async (cartId) => {
    await API.delete(`/cart/${cartId}`);
    fetchCart();
  };

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  if (items.length === 0) {
    return (
      <div>
        <h1 className="page-title" style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <p>Your cart is empty. <Link to="/products">Start shopping!</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
        <Link to="/products" className="btn btn-secondary">← Continue Shopping</Link>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="card" style={{ padding: '0' }}>
          {items.map((item) => (
            <div className="cart-item" key={item.cart_id}>
              <div className="cart-item-img">
                {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} /> : '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                <div style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{parseFloat(item.price).toFixed(2)}</div>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => updateQty(item.cart_id, item.quantity - 1)}>−</button>
                <span style={{ fontWeight: '700', minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQty(item.cart_id, item.quantity + 1)}>+</button>
              </div>
              <div style={{ fontWeight: '700', minWidth: '80px', textAlign: 'right' }}>
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.cart_id)}>✕</button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card">
            <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Subtotal ({items.length} items)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>Free</span>
            </div>
            <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
            </div>
            <button
              id="proceed-checkout-btn"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/checkout', { state: { total } })}
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
