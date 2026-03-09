import { useState } from 'react';
import { X } from 'lucide-react';
import { createExpense, updateExpense } from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'];

export default function ExpenseForm({ expense, onClose, onSaved, showToast }) {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || 'Food',
    date: expense?.date || new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.date) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEdit) {
        await updateExpense(expense.id, payload);
      } else {
        await createExpense(payload);
      }
      onSaved();
    } catch {
      showToast('Failed to save expense', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>{isEdit ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="btn-icon" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              placeholder="e.g. Grocery shopping"
              value={form.title}
              onChange={handleChange}
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
              value={form.amount}
              onChange={handleChange}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
