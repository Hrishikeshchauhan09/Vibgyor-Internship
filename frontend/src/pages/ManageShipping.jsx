import { useState, useEffect } from 'react';
import API from '../api/axios';

const ManageShipping = () => {
  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ courier_service: '', tracking_number: '', shipping_status: '' });

  const fetchShippings = async () => {
    try {
      const { data } = await API.get('/shipping/all');
      setShippings(data);
    } catch (err) {
      console.error('Failed to load shipping records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippings();
  }, []);

  const handleEditClick = (ship) => {
    setEditingId(ship.shipping_id);
    setEditForm({
      courier_service: ship.courier_service,
      tracking_number: ship.tracking_number,
      shipping_status: ship.shipping_status
    });
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    try {
      await API.put(`/shipping/${id}`, editForm);
      setEditingId(null);
      fetchShippings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating shipping details');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="dashboard-title">Shipping Management</h2>
        <p className="dashboard-subtitle">Update courier tracking numbers and shipping statuses for all orders.</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer / Address</th>
                <th>Courier Service</th>
                <th>Tracking Number</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shippings.map((ship) => (
                <tr key={ship.shipping_id}>
                  <td style={{ fontWeight: 600 }}>#{ship.order_id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ship.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {ship.shipping_address ? ship.shipping_address.substring(0, 40) + '...' : 'N/A'}
                    </div>
                  </td>
                  
                  {editingId === ship.shipping_id ? (
                    <td colSpan="4">
                      <form onSubmit={(e) => handleUpdate(e, ship.shipping_id)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={editForm.courier_service} 
                          onChange={e => setEditForm({...editForm, courier_service: e.target.value})}
                          placeholder="Courier (e.g. BlueDart)"
                          required
                        />
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={editForm.tracking_number} 
                          onChange={e => setEditForm({...editForm, tracking_number: e.target.value})}
                          placeholder="Tracking ID"
                          required
                        />
                        <select 
                          className="form-control form-control-sm" 
                          value={editForm.shipping_status}
                          onChange={e => setEditForm({...editForm, shipping_status: e.target.value})}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <button type="submit" className="btn btn-primary btn-sm">Save</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td>{ship.courier_service}</td>
                      <td style={{ fontFamily: 'monospace', background: 'var(--bg-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {ship.tracking_number}
                      </td>
                      <td>
                        <span className={`badge ${
                          ship.shipping_status === 'Delivered' ? 'badge-success' : 
                          ship.shipping_status === 'Shipped' || ship.shipping_status === 'In Transit' ? 'badge-primary' : 'badge-secondary'
                        }`}>
                          {ship.shipping_status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEditClick(ship)}>
                          Edit Info
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {shippings.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No shipping records found.
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

export default ManageShipping;
