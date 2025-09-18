import React, { useState } from 'react';
import ahhhGif from '../../assets/ahhh.gif';
import zumoBanditRunGif from '../../assets/zumo-bandit-run.gif';
import userDataService from '../services/UserDataService';

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

    // Google Sign-In handler
    const handleGoogleSignIn = () => {
      window.location.href = '/api/auth/google';
    };

  const validateInputs = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login user via API
        await userDataService.loginUser(username.trim(), password);
        console.log(`Login successful: ${username.trim()}`);
        onLogin(username.trim());
        
      } else {
        // Register user via API
        await userDataService.registerUser(username.trim(), password);
        console.log(`Registration successful: ${username.trim()}`);
        onLogin(username.trim());
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          {isLogin && (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1em', marginBottom: '1em'}}>
              <img src={ahhhGif} alt="Ahhh" style={{width: '120px'}} />
              <img src={zumoBanditRunGif} alt="Zumo Bandit Run" style={{width: '120px'}} />
            </div>
          )}
          <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to continue your journey' : 'Start your personal development journey'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <button type="button" className="google-signin-btn" onClick={handleGoogleSignIn}>
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style={{ width: 20, marginRight: 8, verticalAlign: 'middle' }} />
              Sign in with Google
            </button>
          </div>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="switch-button" 
              onClick={switchMode}
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="auth-info">
          <h3>🌟 Your Personal Development Hub</h3>
          <ul>
            <li>📊 Track your skills across multiple categories</li>
            <li>❤️ Monitor your health and wellness goals</li>
            <li>🎯 Get daily motivation and progress insights</li>
            <li>📁 Export your data for AI analysis</li>
            <li>🔒 Your data is securely stored and synced across devices</li>
            <li>☁️ Cross-device synchronization enabled</li>
          </ul>
        </div>

        <div className="connection-status">
          <p style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', marginTop: '1rem' }}>
            🌐 Connected to server - Your data will sync across all devices
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
