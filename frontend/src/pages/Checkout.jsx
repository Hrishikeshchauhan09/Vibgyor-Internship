import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'];

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const total = state?.total || 0;

  const [method, setMethod] = useState('UPI');
  const [addr, setAddr] = useState({ name: '', phone: '', pin: '', flat: '', area: '', city: '', state: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!addr.name || !addr.phone || !addr.pin || !addr.flat || !addr.area || !addr.city || !addr.state) {
      return setError('Please fill in all address fields.');
    }
    if (addr.phone.length !== 10) return setError('Please enter a valid 10-digit mobile number.');
    if (addr.pin.length !== 6) return setError('Please enter a valid 6-digit PIN code.');
    
    const formattedAddress = `${addr.name}, ${addr.phone}\n${addr.flat}, ${addr.area}\n${addr.city}, ${addr.state} - ${addr.pin}`;

    if (!method) return setError('Please select a payment method.');
    setLoading(true);
    setError('');
    try {
      // Place order with shipping cost added
      const { data: orderData } = await API.post('/orders', { total_amount: total + 50, shipping_address: formattedAddress });
      // Record payment
      await API.post('/payment', {
        order_id: orderData.orderId,
        amount: total + 50,
        method,
      });
      navigate('/orders', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Complete your purchase</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Order Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          <span>Subtotal</span>
          <span>₹{parseFloat(total).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          <span>Shipping Cost</span>
          <span>₹50.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <span>Total to Pay</span>
          <span>₹{parseFloat(total + 50).toFixed(2)}</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Delivery Address</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Full Name *</label>
            <input type="text" className="form-control" value={addr.name} onChange={e => setAddr({...addr, name: e.target.value})} placeholder="First and Last Name" />
          </div>
          
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Mobile Number *</label>
            <input type="tel" className="form-control" value={addr.phone} onChange={e => setAddr({...addr, phone: e.target.value.replace(/\D/g, '')})} maxLength="10" placeholder="10-digit mobile number" />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>PIN Code *</label>
            <input type="text" className="form-control" value={addr.pin} onChange={e => setAddr({...addr, pin: e.target.value.replace(/\D/g, '')})} maxLength="6" placeholder="6 digits (e.g. 400001)" />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Flat, House no., Building, Company, Apartment *</label>
            <input type="text" className="form-control" value={addr.flat} onChange={e => setAddr({...addr, flat: e.target.value})} placeholder="e.g. 201, Shanti Niwas" />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Area, Street, Sector, Village *</label>
            <input type="text" className="form-control" value={addr.area} onChange={e => setAddr({...addr, area: e.target.value})} placeholder="e.g. Linking Road, Bandra West" />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Town/City *</label>
            <input type="text" className="form-control" value={addr.city} onChange={e => setAddr({...addr, city: e.target.value})} placeholder="e.g. Mumbai" />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>State *</label>
            <select className="form-control" value={addr.state} onChange={e => setAddr({...addr, state: e.target.value})}>
              <option value="">Choose a state...</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Delhi">Delhi</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Other">Other...</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Select Payment Method</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {PAYMENT_METHODS.map((pm) => (
            <label
              key={pm}
              htmlFor={`pm-${pm}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                border: `2px solid ${method === pm ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: method === pm ? 'var(--primary-light)' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="radio"
                id={`pm-${pm}`}
                name="payment_method"
                value={pm}
                checked={method === pm}
                onChange={() => setMethod(pm)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: '600', color: method === pm ? 'var(--primary)' : 'var(--text-primary)' }}>{pm}</span>
            </label>
          ))}
        </div>

        <button
          id="place-order-btn"
          className="btn btn-success btn-lg"
          style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
          onClick={handleCheckout}
          disabled={loading || total === 0}
        >
          {loading ? 'Processing...' : `✓ Place Order — ₹${parseFloat(total + 50).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
