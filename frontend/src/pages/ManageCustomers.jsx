import { useState, useEffect } from 'react';
import API from '../api/axios';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Provisioning state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Update state
  const [showEdit, setShowEdit] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '' });

  // Archiving states
  const [activeTab, setActiveTab] = useState(true); // true for active, false for inactive
  const [showConfirm, setShowConfirm] = useState(null);

  const fetchCustomers = async () => {
    try {
      const { data } = await API.get('/customers');
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setModalLoading(true);
    try {
      await API.post('/customers', form);
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', password: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer.');
    } finally {
      setModalLoading(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/customers/${showEdit.id}`, editForm);
      setShowEdit(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating customer');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/customers/${id}/status`, { status: newStatus });
      setShowConfirm(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  const displayedCustomers = customers.filter(c => c.status === (activeTab ? 1 : 0));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="dashboard-title">Customer Management</h2>
          <p className="dashboard-subtitle">Add, update, and manage your customers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab(true)}
          style={{ 
            background: 'none', border: 'none', 
            borderBottom: activeTab ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab ? '600' : '400',
            padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem'
          }}
        >
          Active Customers
        </button>
        <button 
          onClick={() => setActiveTab(false)}
          style={{ 
            background: 'none', border: 'none', 
            borderBottom: !activeTab ? '2px solid var(--danger)' : '2px solid transparent',
            color: !activeTab ? 'var(--danger)' : 'var(--text-secondary)',
            fontWeight: !activeTab ? '600' : '400',
            padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem'
          }}
        >
          Deactivated
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedCustomers.map((customer) => (
                <tr key={customer.user_id}>
                  <td style={{ fontWeight: 600 }}>{customer.first_name} {customer.last_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || '-'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td>
                    {activeTab ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => {
                            setEditForm({ first_name: customer.first_name, last_name: customer.last_name || '', phone: customer.phone || '' });
                            setShowEdit({ id: customer.user_id });
                          }}
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: '#f1f5f9', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => setShowConfirm({ id: customer.user_id, status: 0, name: customer.first_name })}
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Deactivate
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-sm btn-secondary" 
                        onClick={() => handleStatusChange(customer.user_id, 1)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {displayedCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No {activeTab ? 'active' : 'deactivated'} customers found.
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
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Deactivate Customer?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Are you sure you want to deactivate <strong>{showConfirm.name}</strong>'s account? They will lose access to login.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleStatusChange(showConfirm.id, showConfirm.status)} style={{ flex: 1 }}>
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(null)} style={{ zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Customer</h3>
              <button className="modal-close" onClick={() => setShowEdit(null)}>×</button>
            </div>
            <form onSubmit={submitEdit}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" name="first_name" className="form-control" value={editForm.first_name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" name="last_name" className="form-control" value={editForm.last_name} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" name="phone" className="form-control" value={editForm.phone} onChange={handleEditChange} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Customer</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" name="first_name" className="form-control" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" name="last_name" className="form-control" value={form.last_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" name="phone" className="form-control" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading} style={{ flex: 1 }}>
                  {modalLoading ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;
