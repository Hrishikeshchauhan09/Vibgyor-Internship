import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, cartItems: 0, leaves: 0 });
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, ordersRes, cartRes, leavesRes] = await Promise.all([
          API.get('/products'),
          API.get('/categories'),
          API.get('/orders'),
          API.get('/cart'),
          API.get('/leaves')
        ]);
        setStats({
          products: productsRes.data.length,
          categories: categoriesRes.data.length,
          orders: ordersRes.data.length,
          cartItems: cartRes.data.length,
          leaves: leavesRes.data.filter(l => l.status === 'pending').length
        });
        setOrders(ordersRes.data.slice(0, 5));

        // Aggregate recent activities
        const recentLog = [];
        
        // Latest orders
        [...ordersRes.data].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3).forEach(o => {
          recentLog.push({ id: `ord-${o.order_id}`, icon: '🛒', type: 'Sales', text: `New order #${o.order_id} placed for ₹${o.total_amount}`, date: new Date(o.created_at) });
        });

        // Latest leaves
        [...leavesRes.data].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3).forEach(l => {
          recentLog.push({ id: `lv-${l.id}`, icon: '📅', type: 'HR', text: `Leave request for ${new Date(l.start_date).toLocaleDateString()} is ${l.status}`, date: new Date(l.created_at) });
        });

        // Latest products (if Admin)
        if (isAdmin()) {
          [...productsRes.data].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 2).forEach(p => {
            recentLog.push({ id: `prod-${p.product_id}`, icon: '📦', type: 'Catalogue', text: `Product '${p.name}' added to store`, date: new Date(p.created_at) });
          });
        }

        // Sort combined to get newest overall
        recentLog.sort((a, b) => b.date - a.date);
        setActivities(recentLog.slice(0, 4));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusBadge = (status) => {
    const map = { pending: 'badge-warning', confirmed: 'badge-primary', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-primary'}`}>{status}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's what's happening in your store today.</p>
        </div>
        <Link to="/products" className="btn btn-primary">Browse Products →</Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div>
            <div className="stat-value">98%</div>
            <div className="stat-label">Employee Attendance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink">📅</div>
          <div>
            <div className="stat-value">{stats.leaves}</div>
            <div className="stat-label">Pending Leaves</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📦</div>
          <div>
            <div className="stat-value">{stats.products}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🛒</div>
          <div>
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Recent Orders</div>
          </div>
        </div>
      </div>

      {/* Recent Activities Component */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Activities</h2>
        </div>
        {activities.length === 0 ? (
           <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No recent activities.</div>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {activities.map((act, index) => (
              <li key={act.id} style={{ padding: '0.75rem 0', borderBottom: index < activities.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span title={act.date.toLocaleString()}>{act.icon} <strong>{act.type}:</strong> {act.text} <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({act.date.toLocaleDateString()})</span></span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Orders</h2>
          <Link to="/orders" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No orders yet. <Link to="/products">Start shopping!</Link></p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td><strong>#{order.order_id}</strong></td>
                    <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>{statusBadge(order.status)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
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

export default Dashboard;
