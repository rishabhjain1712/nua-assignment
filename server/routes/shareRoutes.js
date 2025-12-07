const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  shareWithUser,
  generateShareLink,
  accessViaLink,
  getMyShares,
  revokeShare
} = require('../controllers/shareController');

// All routes require authentication except accessViaLink
router.post('/user', auth, shareWithUser);
router.post('/link', auth, generateShareLink);
router.get('/link/:token', auth, accessViaLink);
router.get('/my-shares', auth, getMyShares);
router.delete('/:shareId', auth, revokeShare);

module.exports = router;