import React, { useState } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';

const Dashboard = () => {
  const [refreshFiles, setRefreshFiles] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshFiles(!refreshFiles);
  };

  return (
    <div>
      <h1 style={styles.title}>File Drive</h1>
      <p style={styles.subtitle}>Upload, manage, and share your files</p>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Upload Files</h2>
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      <FileList key={refreshFiles} />
    </div>
  );
};

const styles = {
  title: {
    fontSize: '32px',
    color: '#1976d2',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px'
  }
};

export default Dashboard;