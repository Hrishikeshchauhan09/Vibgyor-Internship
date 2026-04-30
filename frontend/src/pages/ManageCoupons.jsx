import { useState, useEffect } from 'react';
import API from '../api/axios';

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    coupon_code: '',
    discount_type: 'Percentage',
    discount_value: '',
    valid_from: '',
    valid_to: '',
    usage_limit: ''
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get('/coupons');
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/coupons', formData);
      setShowForm(false);
      setFormData({ coupon_code: '', discount_type: 'Percentage', discount_value: '', valid_from: '', valid_to: '', usage_limit: '' });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await API.put(`/coupons/${id}/status`, { status: !currentStatus });
      setCoupons(coupons.map(c => c.coupon_id === id ? { ...c, status: !currentStatus } : c));
    } catch (err) {
      alert('Error updating status');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dashboard-title">Coupon & Discount Codes</h2>
          <p className="dashboard-subtitle">Create and manage discount codes for customers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Create New Coupon</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Coupon Code (e.g. DIWALI50)</label>
              <input type="text" className="form-control" value={formData.coupon_code} onChange={e => setFormData({...formData, coupon_code: e.target.value.toUpperCase()})} required />
            </div>
            
            <div className="form-group">
              <label>Discount Type</label>
              <select className="form-control" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed Amount">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Discount Value</label>
              <input type="number" step="0.01" className="form-control" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>Usage Limit (0 for unlimited)</label>
              <input type="number" className="form-control" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>Valid From</label>
              <input type="datetime-local" className="form-control" value={formData.valid_from} onChange={e => setFormData({...formData, valid_from: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>Valid To (Expiry)</label>
              <input type="datetime-local" className="form-control" value={formData.valid_to} onChange={e => setFormData({...formData, valid_to: e.target.value})} required />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-success">Save Coupon</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Validity</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.coupon_id}>
                  <td><strong style={{ background: 'var(--bg-light)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px dashed var(--primary)' }}>{c.coupon_code}</strong></td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {c.discount_type === 'Percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>From:</span> {new Date(c.valid_from).toLocaleString()}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>To:</span> <strong style={{ color: new Date(c.valid_to) < new Date() ? 'var(--danger)' : 'inherit'}}>{new Date(c.valid_to).toLocaleString()}</strong></div>
                  </td>
                  <td>
                    {c.used_count} / {c.usage_limit === 0 ? '∞' : c.usage_limit}
                  </td>
                  <td>
                    <span className={`badge ${c.status ? 'badge-success' : 'badge-danger'}`}>
                      {c.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn btn-sm ${c.status ? 'btn-danger' : 'btn-primary'}`} 
                      onClick={() => toggleStatus(c.coupon_id, c.status)}
                    >
                      {c.status ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No coupons created yet.
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

export default ManageCoupons;
