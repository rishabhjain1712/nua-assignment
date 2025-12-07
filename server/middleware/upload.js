const { upload } = require('../config/multerConfig');

const handleUpload = (req, res, next) => {
  const uploadMiddleware = upload.array('files', 10);
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 50MB.' 
        });
      }
      if (err.message === 'Invalid file type.') {
        return res.status(400).json({ 
          message: 'Invalid file type. Allowed types: images, PDF, CSV, text documents.' 
        });
      }
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    next();
  });
};

module.exports = handleUpload;