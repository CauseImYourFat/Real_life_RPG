import React, { useState } from 'react';
import ahhhGif from '../../dist/assets/ahhh.gif';
import zumoBanditRunGif from '../../dist/assets/zumo-bandit-run.gif';
import googleLogo from '../../dist/assets/google-logo.png';
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
            <button
              type="button"
              className="google-signin-btn"
              onClick={handleGoogleSignIn}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: '#fff',
                color: '#444',
                border: '1px solid #ddd',
                borderRadius: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontWeight: 500,
                fontSize: '1rem',
                padding: '10px 24px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, border 0.2s',
                margin: '0 auto',
                outline: 'none',
                minWidth: '220px',
              }}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(66,133,244,0.15)';
                e.currentTarget.style.border = '1px solid #4285f4';
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.border = '1px solid #ddd';
              }}
            >
              <img
                src={googleLogo}
                alt="Google logo"
                style={{ width: 22, height: 22, background: 'none', borderRadius: '50%' }}
              />
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>Sign in with Google</span>
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

          {/* Patch/Deploy Log Panel */}
          <div className="patch-log-panel" style={{
            background: '#222',
            borderRadius: '18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            margin: '24px 0',
            padding: '20px',
            color: '#fff',
            maxWidth: '420px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <h3 style={{marginTop:0, marginBottom:'12px', fontWeight:600, fontSize:'1.15rem', color:'#00d4aa'}}>🚀 Patch & Deploy Log</h3>
            <div style={{fontSize:'0.98rem', lineHeight:'1.5'}}>
                <div style={{marginBottom:'10px'}}><b>2025-09-18</b> — Major Patch & Security Update</div>
                <ul style={{paddingLeft:'1.2em', marginBottom:'10px'}}>
                  <li>Google Sign-In integration (OAuth2) for secure authentication</li>
                  <li>Modernized Google Sign-In button UI</li>
                  <li>Backend security hardening (OWASP Top 10: input validation, HTTPS, logging, secure headers)</li>
                  <li>Automated weekly dependency updates via Dependabot (no popup, updates are managed via GitHub PRs)</li>
                  <li>Privacy Policy and Terms of Service pages deployed for Google OAuth verification</li>
                </ul>
              <div style={{marginBottom:'10px'}}><b>2025-09-16</b> — Asset, Point System, and Donut Animation</div>
              <ul style={{paddingLeft:'1.2em', marginBottom:'10px'}}>
                <li>Fixed asset references and mascot images</li>
                <li>Added Gnee!! Point System and donut animation</li>
                <li>Improved mobile layout and header</li>
              </ul>
            </div>
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
