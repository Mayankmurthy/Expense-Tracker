import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function Register({ showToast }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(formData);
      loginUser(data.user, data.token);
      showToast('Account created successfully!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="logo-icon">💰</div>
          <h1>Create Account</h1>
          <p>Join SpendWise today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <UserPlus size={18} className="field-icon" />
              <input
                type="text"
                placeholder="Choose a username"
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
            {loading ? 'Creating account...' : 'Sign Up'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
