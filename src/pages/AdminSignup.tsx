import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSignup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, password, 'admin');
            alert('Admin registration successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ borderTop: '4px solid #ef4444' }}>
                <div className="auth-header">
                    <div className="auth-logo" style={{ color: '#ef4444' }}><i className="fas fa-shield-halved"></i></div>
                    <h2 className="auth-title">Admin Registration</h2>
                    <p className="auth-subtitle">Elevated access portal</p>
                </div>

                {error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Admin Username</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            placeholder="Choose a secure username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Admin Password</label>
                        <input
                            type="password"
                            className="form-input"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="auth-btn" style={{ background: '#ef4444' }}>Register Admin</button>
                </form>

                <div className="auth-footer">
                    Back to <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
