import React, { useState } from 'react';
import userDataService from '../services/UserDataService';

function SettingsPage({ onClose, currentUser }) {
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Account settings state
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile settings state
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const showMessage = (text, isError = false) => {
    if (isError) {
      return (
        <div className="settings-page">
          <div className="settings-overlay" onClick={onClose}></div>
          <div className="settings-container">
            <div className="settings-header">
              <h2>⚙️ Settings</h2>
              <button className="close-button" onClick={onClose}>✕</button>
            </div>

            <div className="settings-content">
              <div className="settings-sidebar">
                {sections.map(section => (
                  <button
                    key={section.id}
                    className={`sidebar-item${activeSection === section.id ? ' active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="sidebar-icon">{section.icon}</span>
                    <span>{section.name}</span>
                  </button>
                ))}
              </div>
              <div className="settings-main">
                {/* ...existing settings UI... */}
                <button onClick={onRefreshData} style={{ background: '#00d4aa', color: '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, marginTop: 10, cursor: 'pointer' }}>🔄 Refresh Data</button>
              </div>
            </div>
          </div>
          {/* Styles should be outside the return, or use a <style> tag inside the main div if using styled-jsx */}
          <style jsx>{`
            /* ...existing styles... */
          `}</style>
        </div>
      );
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showMessage('Current password is required', true);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showMessage('New password must be at least 6 characters long', true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', true);
      return;
    }

    setLoading(true);
    try {
      await userDataService.changePassword(currentPassword, newPassword);
      showMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showMessage(err.message || 'Failed to change password', true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await userDataService.updateProfile({
        description: description.trim(),
        profileImage: profileImage.trim()
      });
      showMessage('Profile updated successfully!');
    } catch (err) {
      showMessage(err.message || 'Failed to update profile', true);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'profile', name: 'Profile', icon: '🖼️' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'data', name: 'Data', icon: '📊' }
  ];

  return (
    <div className="settings-page">
      <div className="settings-overlay" onClick={onClose}></div>
      <div className="settings-container">
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            {sections.map(section => (
              <button
                key={section.id}
                className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="sidebar-icon">{section.icon}</span>
                <span className="sidebar-name">{section.name}</span>
              </button>
            ))}
          </div>

          <div className="settings-main">
            {message && (
              <div className="message success">{message}</div>
            )}
            {error && (
              <div className="message error">{error}</div>
            )}

            {activeSection === 'account' && (
              <div className="settings-section">
                <h3>Account Settings</h3>
                
                <div className="setting-group">
                  <label>Change Username</label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder={`Current: ${currentUser}`}
                      disabled={loading}
                    />
                    <button 
                      className="btn-primary"
                      onClick={handleChangeUsername}
                      disabled={loading || !newUsername.trim()}
                    >
                      {loading ? 'Changing...' : 'Change'}
                    </button>
                  </div>
                  <small>Username must be at least 3 characters long</small>
                </div>

                <div className="setting-group">
                  <label>Change Password</label>
                  <div className="password-fields">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      disabled={loading}
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                      disabled={loading}
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button 
                      className="btn-primary"
                      onClick={handleChangePassword}
                      disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="settings-section">
                <h3>Profile Settings</h3>
                
                <div className="setting-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={4}
                    maxLength={500}
                    disabled={loading}
                  />
                  <small>{description.length}/500 characters</small>
                </div>

                <div className="setting-group">
                  <label>Profile Image URL</label>
                  <div className="input-group">
                    <input
                      type="url"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      placeholder="https://example.com/your-image.jpg"
                      disabled={loading}
                    />
                    {profileImage && (
                      <div className="image-preview">
                        <img 
                          src={profileImage} 
                          alt="Profile preview" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            showMessage('Invalid image URL', true);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <small>Recommended: 200x200px, formats: JPG, PNG, GIF</small>
                </div>

                <button 
                  className="btn-primary"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="settings-section">
                <h3>Privacy Settings</h3>
                <div className="setting-group">
                  <div className="setting-item">
                    <label>Data Visibility</label>
                    <select disabled>
                      <option>Private (default)</option>
                    </select>
                    <small>Your data is always private and secure</small>
                  </div>
                  
                  <div className="setting-item">
                    <label>Cross-Device Sync</label>
                    <div className="toggle-switch">
                      <input type="checkbox" checked disabled />
                      <span className="toggle-slider"></span>
                    </div>
                    <small>Automatically sync your data across all devices</small>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="settings-section">
                <h3>Data Management</h3>
                <div className="setting-group">
                  <div className="data-info">
                    <h4>📊 Your Data</h4>
                    <p>All your data is securely stored on our servers and automatically synchronized across your devices.</p>
                    
                    <div className="data-stats">
                      <div className="stat-item">
                        <span className="stat-icon">⚔️</span>
                        <span className="stat-label">Skills Tracked</span>
                        <span className="stat-value">Active</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">❤️</span>
                        <span className="stat-label">Health Data</span>
                        <span className="stat-value">Synced</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">☁️</span>
                        <span className="stat-label">Cloud Backup</span>
                        <span className="stat-value">Enabled</span>
                      </div>
                    </div>
                    
                    <p><strong>Note:</strong> Use the Data Export tab in the main app to download your data for analysis or backup.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
        }

        .settings-container {
          position: relative;
          background: #2a2a2a;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          width: 90vw;
          max-width: 800px;
          height: 80vh;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }

        .settings-header h2 {
          margin: 0;
          color: white;
          font-size: 1.4rem;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .close-button:hover {
          opacity: 1;
        }

        .settings-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .settings-sidebar {
          width: 200px;
          background: rgba(255, 255, 255, 0.05);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 0;
        }

        .sidebar-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: white;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
          font-size: 0.9rem;
        }

        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-item.active {
          background: rgba(0, 212, 170, 0.2);
          border-right: 3px solid #00d4aa;
        }

        .sidebar-icon {
          font-size: 1.1rem;
        }

        .sidebar-name {
          font-weight: 500;
        }

        .settings-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .message.success {
          background: rgba(0, 212, 170, 0.2);
          border: 1px solid #00d4aa;
          color: #00d4aa;
        }

        .message.error {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid #ff6b6b;
          color: #ff6b6b;
        }

        .settings-section h3 {
          margin: 0 0 1.5rem 0;
          color: white;
          font-size: 1.2rem;
        }

        .setting-group {
          margin-bottom: 2rem;
        }

        .setting-group label {
          display: block;
          color: white;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .input-group {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .input-group input {
          flex: 1;
        }

        .setting-group input, .setting-group textarea, .setting-group select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          font-size: 0.9rem;
        }

        .setting-group input:focus, .setting-group textarea:focus, .setting-group select:focus {
          outline: none;
          border-color: #00d4aa;
          box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2);
        }

        .password-fields {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .password-fields input {
          width: 100%;
        }

        .image-preview {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: #00d4aa;
          border: 1px solid #00d4aa;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          white-space: nowrap;
        }

        .btn-primary:hover:not(:disabled) {
          background: #00b894;
          border-color: #00b894;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .setting-group small {
          display: block;
          color: #aaa;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .toggle-switch {
          position: relative;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #00d4aa;
          transition: 0.4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .data-info h4 {
          color: white;
          margin: 0 0 1rem 0;
        }

        .data-info p {
          color: #ccc;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .data-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin: 1.5rem 0;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .stat-icon {
          font-size: 1.1rem;
        }

        .stat-label {
          flex: 1;
          color: white;
          font-weight: 500;
        }

        .stat-value {
          color: #00d4aa;
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .settings-container {
            width: 95vw;
            height: 90vh;
          }

          .settings-content {
            flex-direction: column;
          }

          .settings-sidebar {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            padding: 0.5rem;
          }

          .sidebar-item {
            flex-shrink: 0;
            min-width: 120px;
          }

          .settings-main {
            padding: 1rem;
          }

          .input-group {
            flex-direction: column;
          }

          .password-fields {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SettingsPage;