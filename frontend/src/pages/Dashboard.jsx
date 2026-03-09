import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { getAllExpenses } from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import { useAuth } from '../context/AuthContext';
import { detectSubscriptions } from '../utils/finance';

const CATEGORY_COLORS = {
  Food:          { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  Transport:     { bg: 'rgba(96,165,250,0.15)',   text: '#60a5fa' },
  Entertainment: { bg: 'rgba(167,139,250,0.15)',  text: '#a78bfa' },
  Health:        { bg: 'rgba(52,211,153,0.15)',   text: '#34d399' },
  Shopping:      { bg: 'rgba(249,115,22,0.15)',   text: '#fb923c' },
  Bills:         { bg: 'rgba(248,113,113,0.15)',  text: '#f87171' },
  Other:         { bg: 'rgba(148,163,184,0.15)',  text: '#94a3b8' },
};

export default function Dashboard({ showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { stealthMode } = useAuth();

  const loadExpenses = () => {
    getAllExpenses()
      .then(r => setExpenses(r.data))
      .catch(() => {});
  };

  useEffect(() => { loadExpenses(); }, []);

  const totalExpenses = expenses.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const monthExpenses = thisMonth.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0);
  const monthIncome = thisMonth.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);

  // Category breakdown (only for expenses)
  const byCategory = expenses.filter(e => e.type !== 'income').reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  const subscriptions = detectSubscriptions(expenses);
  const totalSubsCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  // Recent 5
  const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Your financial overview at a glance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span>＋</span> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="card summary-card">
          <div className="icon-wrap" style={{ background: 'rgba(52,211,153,0.15)' }}>
            <TrendingUp size={22} color="#34d399" />
          </div>
          <p className="label">Total Income</p>
          <p className={`value ${stealthMode ? 'stealth-blur active' : ''}`} style={{ color: '#34d399' }}>₹{totalIncome.toFixed(2)}</p>
          <p className="sub">all time earnings</p>
        </div>
        <div className="card summary-card">
          <div className="icon-wrap" style={{ background: 'rgba(248,113,113,0.15)' }}>
            <DollarSign size={22} color="#f87171" />
          </div>
          <p className="label">Total Expenses</p>
          <p className={`value ${stealthMode ? 'stealth-blur active' : ''}`} style={{ color: '#f87171' }}>₹{totalExpenses.toFixed(2)}</p>
          <p className="sub">{expenses.filter(e => e.type !== 'income').length} transactions</p>
        </div>
        <div className="card summary-card" style={{ background: netBalance >= 0 ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)' }}>
          <div className="icon-wrap" style={{ background: netBalance >= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)' }}>
            <UserIcon size={22} color={netBalance >= 0 ? '#34d399' : '#f87171'} />
          </div>
          <p className="label">Net Balance</p>
          <p className={`value ${stealthMode ? 'stealth-blur active' : ''}`} style={{ color: netBalance >= 0 ? '#34d399' : '#f87171' }}>
            ₹{netBalance.toFixed(2)}
          </p>
          <p className="sub">{netBalance >= 0 ? 'Monthly Profit' : 'Budget Deficit'}</p>
        </div>
        <div className="card summary-card">
          <div className="icon-wrap" style={{ background: 'rgba(249,115,22,0.15)' }}>
            <ShoppingCart size={22} color="#fb923c" />
          </div>
          <p className="label">Subscriptions</p>
          <p className="value" style={{ color: '#fb923c' }}>{subscriptions.length}</p>
          <p className="sub">₹{totalSubsCost.toFixed(0)}/mo impact</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Category Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem' }}>Category Breakdown</h3>
          {sortedCategories.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No expense data yet</p>
          ) : sortedCategories.map(([cat, amt]) => {
            const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
            const col = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
            return (
              <div key={cat} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{cat}</span>
                  <span className={stealthMode ? 'stealth-blur active' : ''} style={{ color: col.text, fontWeight: 700 }}>₹{amt.toFixed(2)}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: col.text, height: '100%', borderRadius: '20px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Expenses */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem' }}>Recent Expenses</h3>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No expenses yet</p>
          ) : recent.map(exp => {
            const col = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other;
            return (
              <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: exp.type === 'income' ? 'rgba(52,211,153,0.15)' : col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '16px' }}>
                    {exp.type === 'income' ? '💰' : (exp.category === 'Food' ? '🍔' : exp.category === 'Transport' ? '🚗' : exp.category === 'Entertainment' ? '🎬' : exp.category === 'Health' ? '💊' : exp.category === 'Shopping' ? '🛍️' : exp.category === 'Bills' ? '📄' : '💼')}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.date}</p>
                </div>
                <span className={stealthMode ? 'stealth-blur active' : ''} style={{ fontWeight: 700, color: exp.type === 'income' ? '#34d399' : col.text, fontSize: '0.88rem', flexShrink: 0 }}>
                  {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <ExpenseForm
          onClose={() => setShowModal(false)}
          onSaved={() => { loadExpenses(); showToast('Expense added!'); setShowModal(false); }}
          showToast={showToast}
        />
      )}
    </>
  );
}
