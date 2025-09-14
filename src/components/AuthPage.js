import React, { useState } from 'react';
import userDataService from '../services/UserDataService';

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting offline guest login...');
      
      // Generate a more persistent unique guest ID based on enhanced browser/device fingerprint
      const createDeviceFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint test', 2, 2);
        const canvasFingerprint = canvas.toDataURL();
        
        const fingerprint = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          screen.colorDepth,
          new Date().getTimezoneOffset(),
          navigator.hardwareConcurrency || 'unknown',
          navigator.platform,
          canvasFingerprint.slice(-50) // Last 50 chars of canvas fingerprint
        ].join('|');
        
        return btoa(fingerprint).slice(0, 16).replace(/[^a-zA-Z0-9]/g, '');
      };
      
      // Check if we already have a persistent guest ID
      let guestId = localStorage.getItem('lifeRPG_guestId');
      if (!guestId) {
        guestId = createDeviceFingerprint();
        localStorage.setItem('lifeRPG_guestId', guestId);
      }
      
      const guestUsername = `guest_${guestId}`;
      const sessionToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // Store guest session in localStorage (no server needed)
      localStorage.setItem('lifeRPG_user', JSON.stringify({
        username: guestUsername,
        sessionToken: sessionToken,
        loginTime: new Date().toISOString(),
        isGuest: true,
        offline: true
      }));
      
      // Initialize guest data if not exists
      const existingData = localStorage.getItem(`lifeRPG_data_${guestUsername}`);
      if (!existingData) {
        const defaultData = {
          profile: {
            username: guestUsername,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            level: 1,
            totalSkillPoints: 0
          },
          skills: {},
          health: {},
          preferences: {
            theme: 'dark',
            notifications: true,
            autoSave: true
          },
          achievements: [],
          progressHistory: []
        };
        localStorage.setItem(`lifeRPG_data_${guestUsername}`, JSON.stringify(defaultData));
      }
      
      console.log('Offline guest login successful:', guestUsername);
      onLogin(guestUsername);
      
    } catch (err) {
      console.error('Guest login error:', err);
      setError('Could not create guest session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Use improved login system
        await userDataService.loginUser(username, password);
        console.log(`Login successful: ${username}`);
        onLogin(username);
        
      } else {
        // Use improved registration system
        await userDataService.registerUser(username, password);
        console.log(`Registration successful: ${username}`);
        onLogin(username);
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineAuth = async () => {
    try {
      if (!isLogin) {
        // Create offline account for registration
        const sessionToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const userData = {
          username: username.trim(),
          sessionToken: sessionToken,
          loginTime: new Date().toISOString(),
          isOffline: true,
          offline: true
        };
        
        // Store user session
        localStorage.setItem('lifeRPG_user', JSON.stringify(userData));
        
        // Initialize user data
        const defaultData = {
          profile: {
            username: username.trim(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            level: 1,
            totalSkillPoints: 0
          },
          skills: {},
          health: {},
          preferences: {
            theme: 'dark',
            notifications: true,
            autoSave: true
          },
          achievements: [],
          progressHistory: []
        };
        localStorage.setItem(`lifeRPG_data_${username.trim()}`, JSON.stringify(defaultData));
        
        console.log('Created offline account:', username.trim());
        onLogin(username.trim());
      } else {
        // For login, check if user exists in localStorage
        const existingUsers = Object.keys(localStorage)
          .filter(key => key.startsWith('lifeRPG_data_'))
          .map(key => key.replace('lifeRPG_data_', ''));
        
        if (existingUsers.includes(username.trim())) {
          const sessionToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
          const userData = {
            username: username.trim(),
            sessionToken: sessionToken,
            loginTime: new Date().toISOString(),
            isOffline: true,
            offline: true
          };
          localStorage.setItem('lifeRPG_user', JSON.stringify(userData));
          console.log('Offline login successful:', username.trim());
          onLogin(username.trim());
        } else {
          setError('User not found. Try creating an account or use guest mode.');
        }
      }
    } catch (err) {
      console.error('Offline auth error:', err);
      setError('Failed to authenticate offline. Please try again.');
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

        {/* Guest Mode Button */}
        <div className="guest-mode">
          <button 
            type="button" 
            className="guest-button"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            {loading ? 'Processing...' : '👤 Continue as Guest'}
          </button>
          <p className="guest-info">
            No registration required. Your data will be saved by your device.
          </p>
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
            <li>🔒 Your data is securely stored and private</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
