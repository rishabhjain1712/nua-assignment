import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileAPI } from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      await fileAPI.upload(formData);
      setUploading(false);
      setProgress(0);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <div style={styles.container}>
      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {})
        }}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div style={styles.uploading}>
            <div style={styles.progressBar}>
              <div 
                style={{ 
                  ...styles.progressFill, 
                  width: `${progress}%` 
                }} 
              />
            </div>
            <p>Uploading... {progress}%</p>
          </div>
        ) : (
          <>
            <div style={styles.icon}>📁</div>
            <p style={styles.text}>
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop files here, or click to select files'}
            </p>
            <p style={styles.subtext}>Max file size: 50MB</p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: '20px 0'
  },
  dropzone: {
    border: '2px dashed #1976d2',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    backgroundColor: '#fafafa'
  },
  dropzoneActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1565c0'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  text: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '5px'
  },
  subtext: {
    fontSize: '14px',
    color: '#666'
  },
  uploading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  progressBar: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976d2',
    transition: 'width 0.3s'
  }
};

export default FileUpload;