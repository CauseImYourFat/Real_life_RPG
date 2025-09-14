import React, { useState, useRef, useEffect } from 'react';
import userDataService from '../services/UserDataService';

function UserMenu({ currentUser, onLogout, onShowProfile, onShowSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'delete') {
      setDeleteError('You must type "delete" to confirm');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await userDataService.deleteAccount('delete');
      // Account deleted successfully, logout user
      onLogout();
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const menuItems = [
    {
      label: '👤 Profile',
      onClick: () => {
        onShowProfile && onShowProfile();
        setIsOpen(false);
      }
    },
    {
      label: '⚙️ Settings', 
      onClick: () => {
        onShowSettings && onShowSettings();
        setIsOpen(false);
      }
    },
    {
      label: '🗑️ Delete Account',
      onClick: () => {
        setShowDeleteModal(true);
        setIsOpen(false);
      },
      className: 'danger'
    },
    {
      label: '🚪 Logout',
      onClick: () => {
        onLogout();
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      <div className="user-menu" ref={menuRef}>
        <button 
          className="user-menu-trigger"
          onClick={() => setIsOpen(!isOpen)}
          title={`Logged in as ${currentUser}`}
        >
          <span className="username">{currentUser}</span>
          <span className="menu-dots">⋮</span>
        </button>

        {isOpen && (
          <div className="user-menu-dropdown">
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <div className="user-name">{currentUser}</div>
                <div className="user-status">Online</div>
              </div>
            </div>
            <div className="menu-divider"></div>
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`menu-item ${item.className || ''}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>⚠️ Delete Account</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <p><strong>This action cannot be undone!</strong></p>
              <p>This will permanently delete your account and all associated data:</p>
              <ul>
                <li>All your skills and progress</li>
                <li>Health data and tracking</li>
                <li>Account settings and preferences</li>
                <li>Export history</li>
              </ul>
              
              <p>To confirm, please type <strong>"delete"</strong> in the box below:</p>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type 'delete' to confirm"
                className="delete-confirm-input"
                disabled={deleteLoading}
              />
              
              {deleteError && (
                <div className="error-message">{deleteError}</div>
              )}
            </div>
            
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'delete'}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-menu {
          position: relative;
          display: inline-block;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-menu-trigger:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .username {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .menu-dots {
          font-size: 1.2rem;
          line-height: 1;
          opacity: 0.7;
          transform: rotate(90deg);
        }

        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: #2a2a2a;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          min-width: 200px;
          z-index: 1000;
          overflow: hidden;
          margin-top: 0.25rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
        }

        .user-avatar {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 212, 170, 0.2);
          border-radius: 50%;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          color: white;
          font-size: 0.9rem;
        }

        .user-status {
          font-size: 0.8rem;
          color: #00d4aa;
        }

        .menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: white;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
          font-size: 0.9rem;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .menu-item.danger {
          color: #ff6b6b;
        }

        .menu-item.danger:hover {
          background: rgba(255, 107, 107, 0.1);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal {
          background: #2a2a2a;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h3 {
          margin: 0;
          color: #ff6b6b;
          font-size: 1.2rem;
        }

        .modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .modal-close:hover {
          opacity: 1;
        }

        .modal-content {
          padding: 1.5rem;
          color: white;
        }

        .modal-content p {
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .modal-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .modal-content li {
          margin: 0.5rem 0;
          color: #ccc;
        }

        .delete-confirm-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          font-size: 0.9rem;
          margin: 1rem 0;
        }

        .delete-confirm-input:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
        }

        .error-message {
          color: #ff6b6b;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-delete {
          padding: 0.75rem 1.5rem;
          background: #ff6b6b;
          border: 1px solid #ff6b6b;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete:hover:not(:disabled) {
          background: #ff5252;
          border-color: #ff5252;
        }

        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

export default UserMenu;