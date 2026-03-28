import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, cartItems: 0, leaves: 0 });
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          API.get('/products'),
          API.get('/categories'),
          API.get('/orders'),
          API.get('/cart')
        ];
        if (isAdmin()) promises.push(API.get('/leaves'));

        const res = await Promise.all(promises);
        const [productsRes, categoriesRes, ordersRes, cartRes] = res;
        const leavesRes = isAdmin() ? res[4] : null;
        setStats({
          products: productsRes.data.length,
          categories: categoriesRes.data.length,
          orders: ordersRes.data.length,
          cartItems: cartRes.data.reduce((sum, item) => sum + item.quantity, 0),
          leaves: leavesRes ? leavesRes.data.filter(l => l.status === 'pending').length : 0
        });
        setOrders(ordersRes.data.slice(0, 5));

        const recentLog = [];
        
        if (isAdmin()) {
          [...ordersRes.data].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3).forEach(o => {
            recentLog.push({ id: `ord-${o.order_id}`, icon: '🛒', type: 'Sales', text: `New order #${o.order_id} placed for ₹${parseFloat(o.total_amount).toFixed(2)}`, date: new Date(o.created_at) });
          });
          if (leavesRes) {
            [...leavesRes.data].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3).forEach(l => {
              recentLog.push({ id: `lv-${l.id}`, icon: '📅', type: 'HR', text: `Leave request for ${new Date(l.start_date).toLocaleDateString()} is ${l.status}`, date: new Date(l.created_at) });
            });
          }
          [...productsRes.data].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 2).forEach(p => {
            recentLog.push({ id: `prod-${p.product_id}`, icon: '📦', type: 'Catalogue', text: `Product '${p.name}' added to store`, date: new Date(p.created_at) });
          });
          recentLog.sort((a, b) => b.date - a.date);
          setActivities(recentLog.slice(0, 4));
        }

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

  const openAttendanceModal = async () => {
    setShowAttendance(true);
    if (staff.length === 0) {
      setLoadingStaff(true);
      try {
        const { data } = await API.get('/auth/users');
        setStaff(data);
      } catch (err) {
        console.error("Failed to load staff", err);
      } finally {
        setLoadingStaff(false);
      }
    }
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

      {isAdmin() ? (
        <>
          {/* Admin Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent' }} 
                 onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                 onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                 onClick={openAttendanceModal} title="Click to view full attendance report">
              <div className="stat-icon purple">👥</div>
              <div><div className="stat-value">98%</div><div className="stat-label">Employee Attendance</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pink">📅</div>
              <div><div className="stat-value">{stats.leaves}</div><div className="stat-label">Pending Leaves</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">📦</div>
              <div><div className="stat-value">{stats.products}</div><div className="stat-label">Total Products</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">🛒</div>
              <div><div className="stat-value">{stats.orders}</div><div className="stat-label">Recent Orders</div></div>
            </div>
          </div>

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
        </>
      ) : (
        <>
          {/* Customer Stats Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
            <div className="stat-card" style={{ padding: '1.5rem' }}>
              <div className="stat-icon orange" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>🛒</div>
              <div><div className="stat-value">{stats.cartItems}</div><div className="stat-label">Items in Cart</div></div>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem' }}>
              <div className="stat-icon green" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>📋</div>
              <div><div className="stat-value">{stats.orders}</div><div className="stat-label">Total Orders</div></div>
            </div>
          </div>
        </>
      )}

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

      {/* Attendance Modal (Admin Only) */}
      {showAttendance && (
        <div className="modal-overlay" onClick={() => setShowAttendance(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span> Daily Staff Attendance Report
              </h3>
              <button className="modal-close" onClick={() => setShowAttendance(false)}>×</button>
            </div>
            
            {loadingStaff ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                Retrieving global attendance records...
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Workforce</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{staff.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Attendance Rate Today</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                      {Math.round((staff.filter(u => (u.user_id + new Date().getDate()) % 15 !== 0).length / Math.max(staff.length, 1)) * 100)}%
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reporting Date</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.4rem', color: 'var(--primary)' }}>
                      {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="table-wrapper" style={{ maxHeight: '450px', overflowY: 'auto', border: '1px solid var(--border)' }}>
                  <table style={{ margin: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 1 }}>
                      <tr>
                        <th>Employee Details</th>
                        <th>Role Segment</th>
                        <th>Check-in Time</th>
                        <th>Check-out Time</th>
                        <th>Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((employee) => {
                        // Deterministic mock status using ID and current Day so it safely persists today
                        const isPresent = (employee.user_id + new Date().getDate()) % 15 !== 0; 
                        const checkInTime = isPresent ? `09:${(employee.user_id * 7 % 60).toString().padStart(2, '0')} AM` : '—';
                        const checkOutTime = isPresent ? `06:${(employee.user_id * 13 % 60).toString().padStart(2, '0')} PM` : '—';
                        return (
                          <tr key={employee.user_id} style={{ background: isPresent ? 'transparent' : '#fff5f5' }}>
                            <td>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{employee.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: EMP-{employee.user_id.toString().padStart(4, '0')} • {employee.email}</div>
                            </td>
                            <td><span className={`badge ${employee.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>{employee.role.toUpperCase()}</span></td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{checkInTime}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{checkOutTime}</td>
                            <td>
                              {isPresent 
                                ? <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor'}}></span> Present</span>
                                : <span className="badge badge-danger">Absent / Leave</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
