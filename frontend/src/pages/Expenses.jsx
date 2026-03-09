import { useState, useEffect, useMemo } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { getAllExpenses, deleteExpense } from '../services/api';
import ExpenseForm from '../components/ExpenseForm';

const CATEGORIES = ['All', 'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'];

const CATEGORY_COLORS = {
  Food:          '#fbbf24',
  Transport:     '#60a5fa',
  Entertainment: '#a78bfa',
  Health:        '#34d399',
  Shopping:      '#fb923c',
  Bills:         '#f87171',
  Other:         '#94a3b8',
};

export default function Expenses({ showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editTarget, setEditTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadExpenses = () => {
    getAllExpenses()
      .then(r => setExpenses(r.data))
      .catch(() => showToast('Failed to load expenses', 'error'));
  };

  useEffect(() => { loadExpenses(); }, []);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, search, categoryFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      showToast('Expense deleted');
      loadExpenses();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>All Expenses</h1>
          <p className="subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <span>＋</span> Add Expense
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search expenses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📋</div>
          <h3>No expenses found</h3>
          <p>Try adjusting your search or add a new expense.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => {
                const color = CATEGORY_COLORS[exp.category] || '#94a3b8';
                return (
                  <tr key={exp.id}>
                    <td>{exp.title}</td>
                    <td>
                      <span className="badge" style={{ background: `${color}22`, color }}>
                        {exp.category}
                      </span>
                    </td>
                    <td>{exp.date}</td>
                    <td className="amount-negative">₹{Number(exp.amount).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon edit" title="Edit"
                          onClick={() => { setEditTarget(exp); setShowModal(true); }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon delete" title="Delete"
                          onClick={() => handleDelete(exp.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ExpenseForm
          expense={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={() => {
            loadExpenses();
            showToast(editTarget ? 'Expense updated!' : 'Expense added!');
            setShowModal(false);
            setEditTarget(null);
          }}
          showToast={showToast}
        />
      )}
    </>
  );
}
