const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const handleUpload = require('../middleware/upload');
const {
  uploadFiles,
  getMyFiles,
  getSharedFiles,
  downloadFile,
  deleteFile
} = require('../controllers/fileController');

// All routes require authentication
router.use(auth);

router.post('/upload', handleUpload, uploadFiles);
router.get('/my-files', getMyFiles);
router.get('/shared-with-me', getSharedFiles);
router.get('/download/:id', downloadFile);
router.delete('/:id', deleteFile);

module.exports = router;