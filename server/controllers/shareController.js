const crypto = require('crypto');
const Share = require('../models/Share');
const File = require('../models/File');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const shareWithUser = async (req, res) => {
  try {
    const { fileId, userId, expiresAt } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if user exists
    const userToShare = await User.findById(userId);
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already shared
    const existingShare = await Share.findOne({
      file: fileId,
      sharedWith: userId,
      isActive: true
    });

    if (existingShare) {
      return res.status(400).json({ message: 'File already shared with this user' });
    }

    // Create share
    const share = new Share({
      file: fileId,
      owner: req.user._id,
      sharedWith: userId,
      shareType: 'user',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true
    });

    await share.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'share',
      file: file._id,
      details: { 
        sharedWith: userId, 
        shareType: 'user',
        expiresAt: expiresAt 
      }
    });

    res.status(201).json({
      message: 'File shared successfully',
      share
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const generateShareLink = async (req, res) => {
  try {
    const { fileId, expiresAt } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const shareToken = crypto.randomBytes(32).toString('hex');

    const share = new Share({
      file: fileId,
      owner: req.user._id,
      shareType: 'link',
      shareToken: shareToken,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true
    });

    await share.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'share',
      file: file._id,
      details: { 
        shareType: 'link',
        expiresAt: expiresAt 
      }
    });

    res.status(201).json({
      message: 'Share link generated successfully',
      shareLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`,
      expiresAt: expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const accessViaLink = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await Share.findOne({ 
      shareToken: token,
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }).populate('file');

    if (!share) {
      return res.status(404).json({ message: 'Share link expired or invalid' });
    }

    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required to access shared file' 
      });
    }

    const file = await File.findById(share.file._id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'view',
      file: file._id,
      details: { accessedVia: 'link', shareToken: token }
    });

    res.json({
      message: 'Access granted',
      file: file
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my shares
const getMyShares = async (req, res) => {
  try {
    const shares = await Share.find({ owner: req.user._id })
      .populate('file')
      .populate('sharedWith', 'username email')
      .sort({ createdAt: -1 });

    res.json(shares);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Revoke share
const revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;

    const share = await Share.findById(shareId);
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    if (share.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    share.isActive = false;
    await share.save();

    res.json({ message: 'Share revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  shareWithUser,
  generateShareLink,
  accessViaLink,
  getMyShares,
  revokeShare
};