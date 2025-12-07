import React, { useState, useEffect } from 'react';
import { shareAPI } from '../services/api';

const ShareFileModal = ({ show, onClose, file, onShareSuccess }) => {
  const [shareType, setShareType] = useState('user');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (show) {
        // Fetch users from API (mocked here for simplicity)
      setUsers([
        { _id: '1', username: 'user1', email: 'user1@example.com' },
        { _id: '2', username: 'user2', email: 'user2@example.com' },
        { _id: '3', username: 'user3', email: 'user3@example.com' }
      ]);
    }
  }, [show]);

  const handleShare = async () => {
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      if (shareType === 'user') {
        if (!selectedUser) {
          setMessage('Please select a user');
          return;
        }

        await shareAPI.shareWithUser({
          fileId: file._id,
          userId: selectedUser,
          expiresAt: expiryDate || null
        });

        setMessage('File shared successfully!');
        if (onShareSuccess) onShareSuccess();
      } else {
        const response = await shareAPI.generateLink({
          fileId: file._id,
          expiresAt: expiryDate || null
        });

        setShareLink(response.data.shareLink);
        setMessage('Share link generated successfully!');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Sharing failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Share File</h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.content}>
          {file && (
            <div style={styles.fileInfo}>
              <strong>File:</strong> {file.originalName}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Share Type</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="user"
                  checked={shareType === 'user'}
                  onChange={(e) => setShareType(e.target.value)}
                  style={styles.radio}
                />
                Share with specific user
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="link"
                  checked={shareType === 'link'}
                  onChange={(e) => setShareType(e.target.value)}
                  style={styles.radio}
                />
                Generate shareable link
              </label>
            </div>
          </div>

          {shareType === 'user' ? (
            <div style={styles.formGroup}>
              <label style={styles.label}>Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={styles.select}
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Expiry Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              style={styles.input}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {shareLink && (
            <div style={styles.shareLinkContainer}>
              <label style={styles.label}>Share Link</label>
              <div style={styles.linkBox}>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  style={styles.linkInput}
                />
                <button
                  onClick={copyToClipboard}
                  style={styles.copyBtn}
                >
                  Copy
                </button>
              </div>
              <p style={styles.note}>
                Note: Only authenticated users can access this link
              </p>
            </div>
          )}

          {message && (
            <div style={styles.message}>
              {message}
            </div>
          )}

          <div style={styles.actions}>
            <button
              onClick={onClose}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              style={styles.shareBtn}
              disabled={loading}
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    color: '#333'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  content: {
    padding: '20px'
  },
  fileInfo: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  radio: {
    margin: 0
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  shareLinkContainer: {
    marginTop: '20px'
  },
  linkBox: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  linkInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#f9f9f9'
  },
  copyBtn: {
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  note: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic'
  },
  message: {
    padding: '10px',
    margin: '20px 0',
    borderRadius: '4px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  shareBtn: {
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default ShareFileModal;