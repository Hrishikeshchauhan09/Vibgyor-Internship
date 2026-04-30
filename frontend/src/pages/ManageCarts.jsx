import { useState, useEffect } from 'react';
import API from '../api/axios';

const ManageCarts = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCarts = async () => {
    try {
      const { data } = await API.get('/cart/all');
      setCarts(data);
    } catch (err) {
      console.error('Failed to load abandoned carts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="dashboard-title">Cart Abandonment Dashboard</h2>
        <p className="dashboard-subtitle">Monitor customer carts and items left behind without checkout.</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Cart ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((cart) => (
                <tr key={cart.cart_id}>
                  <td style={{ fontWeight: 600 }}>#{cart.cart_id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cart.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cart.email}</div>
                  </td>
                  <td>{cart.product_name}</td>
                  <td style={{ fontWeight: 600, textAlign: 'center' }}>{cart.quantity}</td>
                  <td style={{ fontWeight: 700 }}>₹{parseFloat(cart.total_price || (cart.price * cart.quantity)).toFixed(2)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(cart.updated_at || cart.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {carts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No items found in any customer carts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageCarts;
