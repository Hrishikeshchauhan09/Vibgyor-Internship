import { useEffect, useState } from 'react';
import API from '../api/axios';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ category_id: '', name: '', description: '', price: '', stock: '', image_url: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAll = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories/all'),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data.filter(c => c.status));
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm({ category_id: '', name: '', description: '', price: '', stock: '', image_url: '' });
    setModal({ open: true, mode: 'create', data: null });
    setError('');
  };

  const openEdit = (product) => {
    setForm({
      category_id: product.category_id || '',
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
    });
    setModal({ open: true, mode: 'edit', data: product });
    setError('');
  };

  const closeModal = () => { setModal({ open: false, mode: 'create', data: null }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal.mode === 'create') {
        await API.post('/products', form);
        setSuccess('Product created successfully!');
      } else {
        await API.put(`/products/${modal.data.product_id}`, form);
        setSuccess('Product updated successfully!');
      }
      closeModal();
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Deactivate "${product.name}"?`)) return;
    try {
      await API.delete(`/products/${product.product_id}`);
      setSuccess(`"${product.name}" deactivated.`);
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate product.');
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.category_id === id);
    return cat ? cat.category_name : '—';
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Management</h1>
          <p className="page-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} in catalogue</p>
        </div>
        <button id="add-product-btn" className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No products yet. Add your first product!</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.product_id}>
                    <td>{p.product_id}</td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{p.description.slice(0, 50)}{p.description.length > 50 ? '…' : ''}</div>}
                    </td>
                    <td><span className="badge badge-primary">{p.category_name || '—'}</span></td>
                    <td><strong style={{ color: 'var(--primary)' }}>₹{parseFloat(p.price).toFixed(2)}</strong></td>
                    <td>
                      <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{p.stock}</span>
                    </td>
                    <td>
                      {p.status
                        ? <span className="badge badge-success">Active</span>
                        : <span className="badge badge-danger">Inactive</span>}
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                      {p.status && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>🗑️ Remove</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.mode === 'create' ? '+ Add New Product' : '✏️ Edit Product'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="prod-name">Product Name *</label>
                  <input
                    id="prod-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Wireless Headphones"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-category">Category *</label>
                  <select
                    id="prod-category"
                    className="form-control"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Price (₹) *</label>
                  <input
                    id="prod-price"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 1299.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="prod-desc">Description</label>
                  <textarea
                    id="prod-desc"
                    className="form-control"
                    placeholder="Product description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-stock">Stock Quantity</label>
                  <input
                    id="prod-stock"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-image">Image URL</label>
                  <input
                    id="prod-image"
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button id="product-form-submit" type="submit" className="btn btn-primary">
                  {modal.mode === 'create' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
