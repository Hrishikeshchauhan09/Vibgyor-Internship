import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [leavesRes, attRes] = await Promise.all([
        API.get('/leaves'),
        API.get('/attendance/today')
      ]);
      setLeaves(leavesRes.data);
      setAttendance(attRes.data);
    } catch (err) {
      console.error('Failed to fetch employee stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleShift = async () => {
    try {
      setLoading(true);
      await API.post('/attendance/toggle');
      await fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating shift');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-primary'}`}>{status}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  let shiftState = 'not_started';
  if (attendance && attendance.check_in && !attendance.check_out) shiftState = 'working';
  if (attendance && attendance.check_out) shiftState = 'completed';

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-title">Welcome back, {user?.name}! 👋</h2>
          <p className="dashboard-subtitle">Employee Portal • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="stats-grid">
        {/* Dynamic Shift Control Card */}
        <div className="stat-card" style={{ 
          background: shiftState === 'working' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                      shiftState === 'completed' ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' :
                      'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1.5rem',
          cursor: shiftState !== 'completed' ? 'pointer' : 'default',
          transition: 'transform 0.2s',
          boxShadow: shiftState === 'working' ? '0 10px 15px -3px rgba(16, 185, 129, 0.3)' : 'var(--shadow-sm)'
        }}
        onClick={shiftState !== 'completed' ? handleToggleShift : undefined}
        onMouseEnter={e => { if(shiftState !== 'completed') e.currentTarget.style.transform = 'scale(1.02)' }}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {shiftState === 'not_started' && (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>👆</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Start Shift</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Click to Clock-In</div>
            </>
          )}
          {shiftState === 'working' && (
            <>
               <div style={{ fontSize: '1.8rem', animation: 'pulse 2s infinite' }}>⏱️</div>
               <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>End Shift</div>
               <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>In since {formatTime(attendance.check_in)}</div>
            </>
          )}
          {shiftState === 'completed' && (
            <>
               <div style={{ fontSize: '2rem' }}>🏁</div>
               <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Shift Completed</div>
               <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total duration logged.</div>
            </>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            {shiftState === 'working' ? '🟢' : shiftState === 'not_started' ? '⚪' : '💤'}
          </div>
          <div>
            <div className="stat-value">
              {shiftState === 'working' ? "Active" : shiftState === 'not_started' ? "Off-Duty" : "Done"}
            </div>
            <div className="stat-label">Current Status</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon indigo">📅</div>
          <div><div className="stat-value">{leaves.length}</div><div className="stat-label">Total Leave Requests</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div><div className="stat-value">{leaves.filter(l => l.status === 'approved').length}</div><div className="stat-label">Approved Leaves</div></div>
        </div>
      </div>

      {shiftState === 'completed' && (
        <div className="alert badge-info" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#f8fafc', borderLeft: '4px solid #64748b' }}>
          <span>🧾</span>
          <strong>Timesheet Summary:</strong>
          <span style={{ color: 'var(--text-secondary)' }}>You clocked in at {formatTime(attendance.check_in)} and finished at {formatTime(attendance.check_out)}. Have a great evening!</span>
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Your Recent Leave Requests</h3>
            <Link to="/leaves" className="btn btn-primary btn-sm">Request Leave</Link>
          </div>
          
          {leaves.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '3rem' }}>🌴</span>
              <p>You haven't submitted any leave requests yet.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
               <table style={{ margin: 0 }}>
                <thead>
                   <tr>
                    <th>Leave Period</th>
                    <th>Reason</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.slice(0, 5).map(leave => (
                    <tr key={leave.id}>
                      <td style={{ fontWeight: 500 }}>
                        {new Date(leave.start_date).toLocaleDateString()} &rarr; {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{leave.reason}</td>
                      <td>{new Date(leave.created_at).toLocaleDateString()}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                     </tr>
                  ))}
                </tbody>
              </table>
               {leaves.length > 5 && (
                <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                  <Link to="/leaves" style={{ color: 'var(--primary)', fontWeight: 500 }}>View all requests &rarr;</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
