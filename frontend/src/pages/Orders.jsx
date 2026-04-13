import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Orders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    API.get(isAdmin() ? '/orders/all' : '/orders')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      // Update local state to avoid full reload
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    }
  };

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
          <h1 className="page-title">{isAdmin() ? 'Global Orders Management' : 'My Orders'}</h1>
          <p className="page-subtitle">{isAdmin() ? 'Track and update all customer shipments' : 'Track all your personal orders here'}</p>
        </div>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{isAdmin() ? 'No orders have been placed on your platform yet.' : 'No orders placed yet. Start shopping!'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  {isAdmin() && <th>Customer</th>}
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td><strong>#{order.order_id}</strong></td>
                    {isAdmin() && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.email}</div>
                      </td>
                    )}
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      {isAdmin() ? (
                        <select 
                          className={`badge ${
                            order.status === 'pending' ? 'badge-warning' : 
                            order.status === 'confirmed' ? 'badge-primary' : 
                            order.status === 'shipped' ? 'badge-info' : 
                            order.status === 'delivered' ? 'badge-success' : 
                            'badge-danger'
                          }`}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.order_id, e.target.value)}
                          style={{ 
                            padding: '0.4rem 1.5rem 0.4rem 0.8rem', 
                            fontSize: '0.75rem', 
                            cursor: 'pointer',
                            border: '1px solid currentColor',
                            outline: 'none',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : statusBadge(order.status)}
                    </td>
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
