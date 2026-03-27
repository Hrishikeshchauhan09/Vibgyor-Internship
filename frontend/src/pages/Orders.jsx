import { useEffect, useState } from 'react';
import API from '../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      confirmed: 'badge-primary',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger'
    };
    return <span className={`badge ${map[status] || 'badge-primary'}`}>{status}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track all your orders here</p>
        </div>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No orders placed yet. Start shopping to place your first order!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td><strong>#{order.order_id}</strong></td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>{statusBadge(order.status)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
