import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login({ showToast }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(formData);
      loginUser(data.user, data.token);
      showToast('Welcome back!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="logo-icon">💰</div>
          <h1>Welcome Back</h1>
          <p>Login to manage your expenses</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
