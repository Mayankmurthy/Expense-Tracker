import { useState, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, List, LogOut, User as UserIcon, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Subscriptions from './pages/Subscriptions';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

const ProtectedRoute = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function Sidebar() {
  const { user, logout, stealthMode, toggleStealthMode } = useAuth();
  const location = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💰</div>
        <div>
          <h2>SpendWise</h2>
          <span>{user ? `Hi, ${user.username}` : 'Expense Tracker'}</span>
        </div>
      </div>

      <NavLink to="/" className={({ isActive }) => `nav-link${isActive && location.pathname === '/' ? ' active' : ''}`}>
        <LayoutDashboard size={18} className="nav-icon" /> Dashboard
      </NavLink>
      <NavLink to="/expenses" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        <List size={18} className="nav-icon" /> All Expenses
      </NavLink>
      <NavLink to="/subscriptions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        <ShieldCheck size={18} className="nav-icon" /> Subscriptions
      </NavLink>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
        <button onClick={toggleStealthMode} className="nav-link" style={{ marginBottom: '8px' }}>
          {stealthMode ? (
            <><EyeOff size={18} className="nav-icon" /> Show Amounts</>
          ) : (
            <><Eye size={18} className="nav-icon" /> Stealth Mode</>
          )}
        </button>
        <button onClick={logout} className="nav-link" style={{ color: 'var(--danger)' }}>
          <LogOut size={18} className="nav-icon" /> Logout
        </button>
      </div>
    </nav>
  );
}

function AppContent() {
  const [toast, setToast] = useState(null);
  const { token } = useAuth();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="app-container">
      {token && <Sidebar />}
      <main className="main-content" style={{ padding: token ? '32px' : '0' }}>
        <Routes>
          <Route path="/login" element={<Login showToast={showToast} />} />
          <Route path="/register" element={<Register showToast={showToast} />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard showToast={showToast} />} />
            <Route path="/expenses" element={<Expenses showToast={showToast} />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
          </Route>
        </Routes>
      </main>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
