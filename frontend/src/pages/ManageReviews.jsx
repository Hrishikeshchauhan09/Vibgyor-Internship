import { useState, useEffect } from 'react';
import API from '../api/axios';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await API.get('/reviews/all');
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (reviewId, newStatus) => {
    try {
      await API.put(`/reviews/${reviewId}/status`, { status: newStatus });
      setReviews(reviews.map(r => r.review_id === reviewId ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Error updating review status');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.review_id !== reviewId));
    } catch (err) {
      alert('Error deleting review');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="dashboard-title">Review Moderation</h2>
        <p className="dashboard-subtitle">Approve, reject, or delete customer reviews before they go live on the site.</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review Text</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.review_id}>
                  <td style={{ fontWeight: 600 }}>{rev.product_name}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rev.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rev.email}</div>
                  </td>
                  <td style={{ color: 'var(--warning)', letterSpacing: '2px' }}>{renderStars(rev.rating)}</td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.4', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                      "{rev.review_text}"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${rev.status ? 'badge-success' : 'badge-warning'}`}>
                      {rev.status ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {!rev.status ? (
                        <button className="btn btn-sm btn-primary" onClick={() => handleModerate(rev.review_id, true)}>
                          Approve
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleModerate(rev.review_id, false)}>
                          Hide
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(rev.review_id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No reviews have been submitted yet.
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

export default ManageReviews;
