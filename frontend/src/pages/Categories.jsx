import { useEffect, useState } from 'react';
import API from '../api/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ category_name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteWarning, setDeleteWarning] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories/all');
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setForm({ category_name: '', description: '' });
    setModal({ open: true, mode: 'create', data: null });
    setError('');
  };

  const openEdit = (cat) => {
    setForm({ category_name: cat.category_name, description: cat.description || '' });
    setModal({ open: true, mode: 'edit', data: cat });
    setError('');
  };

  const closeModal = () => { setModal({ open: false, mode: 'create', data: null }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal.mode === 'create') {
        await API.post('/categories', form);
        setSuccess('Category created successfully!');
      } else {
        await API.put(`/categories/${modal.data.category_id}`, form);
        setSuccess('Category updated successfully!');
      }
      closeModal();
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (cat) => {
    setDeleteWarning(null);
    try {
      await API.delete(`/categories/${cat.category_id}`);
      setSuccess('Category deactivated successfully!');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Product count warning from backend
      if (err.response?.status === 409) {
        setDeleteWarning({ message: err.response.data.message, cat });
      } else {
        setError(err.response?.data?.message || 'Failed to deactivate.');
      }
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Organize products into categories</p>
        </div>
        <button id="create-category-btn" className="btn btn-primary" onClick={openCreate}>+ New Category</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Delete Warning */}
      {deleteWarning && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {deleteWarning.message}</span>
          <button className="btn btn-sm btn-danger" onClick={() => setDeleteWarning(null)}>Dismiss</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No categories found. Create one!</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.category_id}>
                    <td>{cat.category_id}</td>
                    <td><strong>{cat.category_name}</strong></td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '—'}</td>
                    <td><span className="badge badge-primary">{cat.product_count || 0}</span></td>
                    <td>
                      {cat.status
                        ? <span className="badge badge-success">Active</span>
                        : <span className="badge badge-danger">Inactive</span>}
                    </td>
                    <td>{new Date(cat.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>✏️ Edit</button>
                      {cat.status && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)}>🗑️ Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.mode === 'create' ? 'Create New Category' : 'Edit Category'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">Category Name *</label>
                <input
                  id="cat-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Electronics"
                  value={form.category_name}
                  onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-desc">Description</label>
                <textarea
                  id="cat-desc"
                  className="form-control"
                  placeholder="Brief description of the category..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button id="category-form-submit" type="submit" className="btn btn-primary">
                  {modal.mode === 'create' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
