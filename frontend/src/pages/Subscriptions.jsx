import { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { getAllExpenses } from '../services/api';
import { detectSubscriptions, calculateYearlyCost } from '../utils/finance';
import { useAuth } from '../context/AuthContext';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { stealthMode } = useAuth();

  useEffect(() => {
    getAllExpenses()
      .then(r => {
        const detected = detectSubscriptions(r.data);
        setSubscriptions(detected);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalYearly = calculateYearlyCost(totalMonthly);

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <div>
          <h1>Subscription Hunter</h1>
          <p className="subtitle">Identify and manage your recurring bills</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="card summary-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="icon-wrap" style={{ background: 'rgba(108,99,255,0.15)' }}>
            <RefreshCw size={22} color="#6c63ff" />
          </div>
          <p className="label">Active Subscriptions</p>
          <p className="value">{subscriptions.length}</p>
          <p className="sub">Detected recurring items</p>
        </div>
        <div className="card summary-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="icon-wrap" style={{ background: 'rgba(248,113,113,0.15)' }}>
            <AlertCircle size={22} color="#f87171" />
          </div>
          <p className="label">Yearly Impact</p>
          <p className={`value ${stealthMode ? 'stealth-blur active' : ''}`} style={{ color: 'var(--danger)' }}>
            ₹{totalYearly.toFixed(2)}
          </p>
          <p className="sub">Total across 12 months</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Shield color="var(--accent)" size={24} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Detected Services</h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <RefreshCw size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>No recurring expenses detected yet.</p>
            <p style={{ fontSize: '0.8rem' }}>Add the same expense in different months to see them here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Monthly Cost</th>
                  <th>Annual Cost</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{sub.title}</td>
                    <td className={stealthMode ? 'stealth-blur active' : ''}>₹{sub.amount.toFixed(2)}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 700 }} className={stealthMode ? 'stealth-blur active' : ''}>
                      ₹{calculateYearlyCost(sub.amount).toFixed(2)}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-card-hover)' }}>{sub.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px', padding: '24px', background: 'linear-gradient(135deg, rgba(108,99,255,0.05), rgba(248,113,113,0.05))', border: '1px dashed var(--accent)' }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-primary)' }}>💡 Financial Tip</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          "Subscription creep" is real. Small monthly fees like ₹199 might seem tiny, but they cost you <strong>₹{ (199 * 12).toLocaleString() }</strong> every year. Review your list and cancel what you don't use!
        </p>
      </div>
    </div>
  );
}
