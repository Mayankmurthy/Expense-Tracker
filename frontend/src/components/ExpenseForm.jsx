import { useState } from 'react';
import { X } from 'lucide-react';
import { createExpense, updateExpense } from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'];

export default function ExpenseForm({ expense, onClose, onSaved, showToast }) {
  const isEdit = !!expense;
  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [category, setCategory] = useState(expense?.category || 'Food');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().slice(0, 10));
  const [type, setType] = useState(expense?.type || 'expense'); // New state for type
  const [loading, setLoading] = useState(false);

  // The original handleChange is removed as states are now individual
  // const handleChange = e => {
  //   setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || !date) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = { title, amount: parseFloat(amount), category, date, type }; // Include type in payload
      if (isEdit) {
        await updateExpense(expense.id, payload);
      } else {
        await createExpense(payload);
      }
      onSaved();
    } catch (error) {
      console.error("Failed to save expense:", error);
      showToast('Failed to save expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{isEdit ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="type-toggle" style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
            <button 
              type="button"
              onClick={() => setType('expense')}
              className={`toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.3s' }}
            >
              Expense
            </button>
            <button 
              type="button"
              onClick={() => setType('income')}
              className={`toggle-btn ${type === 'income' ? 'active income' : ''}`}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.3s' }}
            >
              Income
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                name="title"
                placeholder="e.g. Grocery shopping"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  name="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
