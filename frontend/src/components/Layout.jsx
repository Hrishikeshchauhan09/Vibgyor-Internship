import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🛒 ShopVibe</h2>
          <span>Ecommerce Platform</span>
        </div>

        <nav className="sidebar-nav">
          {!isEmployee() && (
            <div className="nav-section">
              <div className="nav-section-title">Main</div>
              {isAdmin() && (
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">📊</span> Dashboard
                </NavLink>
              )}
              <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📦</span> Products
              </NavLink>
              <NavLink to="/cart" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🛒</span> Cart
              </NavLink>
              <NavLink to="/wishlist" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">❤️</span> Wishlist
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📋</span> Orders
              </NavLink>
            </div>
          )}

          {isEmployee() && (
            <div className="nav-section">
              <div className="nav-section-title">Employee Portal</div>
              <NavLink to="/employee-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📊</span> My Dashboard
              </NavLink>
              <NavLink to="/leaves" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📅</span> Leave Requests
              </NavLink>
            </div>
          )}

          {isAdmin() && (
            <div className="nav-section">
              <div className="nav-section-title">HR / Admin</div>
              <NavLink to="/admin/staff" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">👥</span> Manage Staff
              </NavLink>
              <NavLink to="/admin/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">👤</span> Manage Customers
              </NavLink>
              <NavLink to="/admin/payments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">💳</span> Payments & Refunds
              </NavLink>
              <NavLink to="/leaves" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📅</span> Leave Requests
              </NavLink>
              <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🏷️</span> Categories
              </NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">📦</span> Manage Products
              </NavLink>
            </div>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{getInitial(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Page Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)} role="dialog" aria-modal="true" aria-labelledby="logout-title" style={{ zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center', padding: '2rem', borderTop: '4px solid var(--danger)' }}>
            {isAdmin() ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
                <h3 id="logout-title" style={{ marginBottom: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>End Admin Session?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>Are you sure you want to securely log out of the ShopVibe Administrative Console?</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👋</div>
                <h3 id="logout-title" style={{ marginBottom: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Leaving so soon?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>Are you sure you want to log out of your ShopVibe account?</p>
              </>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmLogout} style={{ flex: 1, justifyContent: 'center' }}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
