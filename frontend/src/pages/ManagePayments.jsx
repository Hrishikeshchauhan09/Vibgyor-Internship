import { useState, useEffect } from 'react';
import API from '../api/axios';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showConfirm, setShowConfirm] = useState(null);

  const fetchPayments = async () => {
    try {
      const { data } = await API.get('/payment/all');
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (id) => {
    try {
      await API.patch(`/payment/${id}/refund`);
      setShowConfirm(null);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing refund');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="dashboard-title">Payments & Refunds</h2>
        <p className="dashboard-subtitle">Monitor transactions and issue refunds for returned orders.</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((txn) => (
                <tr key={txn.payment_id}>
                  <td style={{ fontWeight: 600 }}>#{txn.payment_id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{txn.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{txn.email}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{parseFloat(txn.amount).toFixed(2)}</td>
                  <td>{txn.payment_method}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                      txn.payment_status === 'Paid' ? 'badge-primary' : 
                      txn.payment_status === 'Refunded' ? 'badge-secondary' : 'badge-danger'
                    }`}>
                      {txn.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {txn.payment_status === 'Paid' ? (
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => setShowConfirm({ id: txn.payment_id, amount: txn.amount, name: txn.customer_name })}
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        Issue Refund
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No payment records found.
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
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💸</div>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Process Refund?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Are you sure you want to refund <strong>₹{parseFloat(showConfirm.amount).toFixed(2)}</strong> to {showConfirm.name}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleRefund(showConfirm.id)} style={{ flex: 1 }}>
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;
