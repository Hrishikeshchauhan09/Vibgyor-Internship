import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const LeaveRequests = () => {
  const { isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ reason: '', start_date: '', end_date: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeaves = async () => {
    try {
      const { data } = await API.get('/leaves');
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/leaves', form);
      setSuccess('Leave request submitted successfully!');
      setModalOpen(false);
      setForm({ reason: '', start_date: '', end_date: '' });
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status });
      setSuccess(`Leave request ${status}!`);
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const statusBadge = (status) => {
    const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin() ? 'HR: Leave Management' : 'My Leave Requests'}</h1>
          <p className="page-subtitle">
            {isAdmin() ? 'Review and manage employee absences' : 'Request time off and track status'}
          </p>
        </div>
        {!isAdmin() && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Request Leave</button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No leave requests found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  {isAdmin() && <th>Employee</th>}
                  <th>Reason</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  {isAdmin() && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>#{leave.id}</td>
                    {isAdmin() && <td><strong>{leave.name}</strong><br/><small style={{color:'var(--text-secondary)'}}>{leave.email}</small></td>}
                    <td style={{ maxWidth: '250px', whiteSpace: 'normal' }}>{leave.reason}</td>
                    <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td>{statusBadge(leave.status)}</td>
                    {isAdmin() && (
                      <td>
                        {leave.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(leave.id, 'approved')}>✓ Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(leave.id, 'rejected')}>✕ Reject</button>
                          </div>
                        ) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leave Request Modal (Employee only) */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request Time Off</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="leave-reason">Reason for Leave *</label>
                <textarea
                  id="leave-reason"
                  className="form-control"
                  placeholder="E.g. Sick leave, vacation, personal..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="leave-start">Start Date *</label>
                  <input
                    id="leave-start"
                    type="date"
                    className="form-control"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="leave-end">End Date *</label>
                  <input
                    id="leave-end"
                    type="date"
                    className="form-control"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
