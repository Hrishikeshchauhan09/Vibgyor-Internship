import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ManageEmployees = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Provisioning state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Archiving states
  const [activeTab, setActiveTab] = useState('active');
  const [showConfirm, setShowConfirm] = useState(null);

  // Reset Password states
  const [showReset, setShowReset] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const fetchStaff = async () => {
    try {
      const { data } = await API.get('/auth/users');
      setStaff(data);
    } catch (err) {
      console.error('Failed to load staff', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setModalLoading(true);
    try {
      await API.post('/auth/add-staff', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/auth/users/${id}/status`, { status: newStatus });
      setShowConfirm(null);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/auth/users/${showReset.id}/password`, { password: resetPasswordVal });
      alert(`Password successfully updated for ${showReset.name}.`);
      setShowReset(null);
      setResetPasswordVal('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving new password');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  const displayedStaff = staff.filter(s => s.account_status === activeTab);

  // Reusable password toggle SVG
  const EyeIcon = ({ revealed, onClick }) => (
    <button 
      type="button" onClick={onClick}
      style={{ 
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
        background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px', color: 'var(--text-secondary)', transition: 'all 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      title={revealed ? "Hide password" : "Show password"}
    >
      {revealed ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )}
    </button>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="dashboard-title">Staff Management</h2>
          <p className="dashboard-subtitle">Securely provision credentials and manage off-boarded employees.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add New Staff</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('active')}
          style={{ 
            background: 'none', border: 'none', 
            borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'active' ? '600' : '400',
            padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem'
          }}
        >
          Active Staff
        </button>
        <button 
          onClick={() => setActiveTab('terminated')}
          style={{ 
            background: 'none', border: 'none', 
            borderBottom: activeTab === 'terminated' ? '2px solid var(--danger)' : '2px solid transparent',
            color: activeTab === 'terminated' ? 'var(--danger)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'terminated' ? '600' : '400',
            padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem'
          }}
        >
          Archived (Off-boarded)
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Role Category</th>
                <th>Work Email</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedStaff.map((employee) => (
                <tr key={employee.user_id}>
                  <td style={{ fontWeight: 600 }}>
                    {employee.name} {employee.user_id === user.id && '(You)'}
                  </td>
                  <td>
                    <span className={`badge ${employee.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {employee.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{employee.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(employee.created_at).toLocaleDateString()}</td>
                  <td>
                    {employee.user_id !== user.id && employee.role !== 'admin' && (
                      activeTab === 'active' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-sm btn-secondary" 
                            onClick={() => setShowReset({ id: employee.user_id, name: employee.name })}
                            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#f1f5f9', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                          >
                            Reset Password
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => setShowConfirm({ id: employee.user_id, status: 'terminated', name: employee.name })}
                            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            Revoke Access
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => handleStatusChange(employee.user_id, 'active')}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          Restore Access
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {displayedStaff.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No {activeTab} staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(null)} style={{ zIndex: 10000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center', padding: '2rem', borderTop: '4px solid var(--danger)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Revoke Credentials?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Are you sure you want to officially terminate access for <strong>{showConfirm.name}</strong>? They will instantly lose access to the portal.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleStatusChange(showConfirm.id, showConfirm.status)} style={{ flex: 1 }}>
                Yes, Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(null)} style={{ zIndex: 10000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Force Reset Password</h3>
              <button className="modal-close" onClick={() => setShowReset(null)}>×</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              You are about to securely overwrite the login credentials for <strong>{showReset.name}</strong>. Their previous password will be instantly deleted.
            </p>
            <form onSubmit={submitResetPassword}>
              <div className="form-group">
                <label className="form-label">Create New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showResetPassword ? 'text' : 'password'} 
                    className="form-control" 
                    value={resetPasswordVal} 
                    onChange={e => setResetPasswordVal(e.target.value)} 
                    required 
                    minLength={6} 
                    placeholder="Enter new 6+ char password" 
                    style={{ paddingRight: '40px' }}
                  />
                  <EyeIcon revealed={showResetPassword} onClick={() => setShowResetPassword(!showResetPassword)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReset(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Provision New Employee</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required placeholder="e.g. Employee Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Corporate Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required placeholder="employee@company.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    className="form-control" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    minLength={6} 
                    placeholder="Secure password" 
                    style={{ paddingRight: '40px' }}
                  />
                  <EyeIcon revealed={showPassword} onClick={() => setShowPassword(!showPassword)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading} style={{ flex: 1 }}>
                  {modalLoading ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
