import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fileAPI, shareAPI } from '../services/api';
import ShareFileModal from './ShareFileModal';

const FileList = () => {
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const [myFilesRes, sharedFilesRes] = await Promise.all([
        fileAPI.getMyFiles(),
        fileAPI.getSharedFiles()
      ]);
      setMyFiles(myFilesRes.data);
      setSharedFiles(sharedFilesRes.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await fileAPI.download(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await fileAPI.delete(fileId);
      fetchFiles();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.includes('image')) return '🖼️';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('csv') || mimetype.includes('excel')) return '📊';
    if (mimetype.includes('text')) return '📝';
    return '📁';
  };

  if (loading) {
    return <div style={styles.loading}>Loading files...</div>;
  }

  return (
    <div>
      <ShareFileModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        file={selectedFile}
        onShareSuccess={fetchFiles}
      />

      {/* My Files Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Files</h2>
        {myFiles.length === 0 ? (
          <div style={styles.empty}>No files uploaded yet.</div>
        ) : (
          <div style={styles.fileGrid}>
            {myFiles.map(file => (
              <div key={file._id} style={styles.fileCard}>
                <div style={styles.fileHeader}>
                  <span style={styles.fileIcon}>
                    {getFileIcon(file.mimetype)}
                  </span>
                  <div style={styles.fileInfo}>
                    <h4 style={styles.fileName}>{file.originalName}</h4>
                    <p style={styles.fileMeta}>
                      {formatFileSize(file.size)} • {format(new Date(file.uploadDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div style={styles.fileActions}>
                  <button
                    onClick={() => handleDownload(file._id, file.originalName)}
                    style={styles.actionBtn}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleShare(file)}
                    style={{ ...styles.actionBtn, ...styles.shareBtn }}
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleDelete(file._id)}
                    style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared With Me Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Shared With Me</h2>
        {sharedFiles.length === 0 ? (
          <div style={styles.empty}>No shared files.</div>
        ) : (
          <div style={styles.fileGrid}>
            {sharedFiles.map(file => (
              <div key={file._id} style={styles.fileCard}>
                <div style={styles.fileHeader}>
                  <span style={styles.fileIcon}>
                    {getFileIcon(file.mimetype)}
                  </span>
                  <div style={styles.fileInfo}>
                    <h4 style={styles.fileName}>{file.originalName}</h4>
                    <p style={styles.fileMeta}>
                      {formatFileSize(file.size)} • Shared by {file.owner?.username}
                    </p>
                  </div>
                </div>
                
                <div style={styles.fileActions}>
                  <button
                    onClick={() => handleDownload(file._id, file.originalName)}
                    style={styles.actionBtn}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  fileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  fileCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  },
  fileHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '15px'
  },
  fileIcon: {
    fontSize: '36px'
  },
  fileInfo: {
    flex: 1
  },
  fileName: {
    margin: 0,
    fontSize: '16px',
    color: '#333',
    wordBreak: 'break-word'
  },
  fileMeta: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#666'
  },
  fileActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  actionBtn: {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  shareBtn: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2'
  },
  deleteBtn: {
    backgroundColor: '#ffebee',
    color: '#d32f2f'
  }
};

export default FileList;