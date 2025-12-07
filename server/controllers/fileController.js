const File = require('../models/File');
const Share = require('../models/Share');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');

// Upload files
const uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = [];

    for (const file of files) {
      const newFile = new File({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        owner: req.user._id
      });

      await newFile.save();
      uploadedFiles.push(newFile);

      await AuditLog.create({
        user: req.user._id,
        action: 'upload',
        file: newFile._id,
        details: { filename: file.originalname, size: file.size }
      });
    }

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's files
const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id })
      .sort({ uploadDate: -1 })
      .populate('owner', 'username email');

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get shared files with me
const getSharedFiles = async (req, res) => {
  try {
    const shares = await Share.find({ 
      sharedWith: req.user._id,
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }).populate({
      path: 'file',
      populate: { path: 'owner', select: 'username email' }
    });

    const files = shares.map(share => share.file).filter(file => file);
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.owner.toString() === req.user._id.toString()) {
      await AuditLog.create({
        user: req.user._id,
        action: 'download',
        file: file._id,
        details: { filename: file.originalName }
      });

      return res.download(file.path, file.originalName);
    }

    const share = await Share.findOne({
      file: fileId,
      sharedWith: req.user._id,
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    });

    if (share) {
      // Log download activity
      await AuditLog.create({
        user: req.user._id,
        action: 'download',
        file: file._id,
        details: { filename: file.originalName, shared: true }
      });

      return res.download(file.path, file.originalName);
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await file.deleteOne();
    
    await Share.deleteMany({ file: file._id });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadFiles,
  getMyFiles,
  getSharedFiles,
  downloadFile,
  deleteFile
};