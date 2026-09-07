const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  listPosts, getPost, createPost, updatePost,
  submitForApproval, schedulePost, publishPost, generateCaption, integrationStatus, deletePost,
} = require('../controllers/postController');

router.use(verifyToken);

// Dashboard / calendar views — all roles can read
router.get('/', listPosts);
router.get('/integration-status', integrationStatus);
router.get('/:id', getPost);

// Creating and editing content — Administrator, Content Creator
router.post('/', requireRole('Administrator', 'Content Creator'), createPost);
router.post('/generate-caption', requireRole('Administrator', 'Content Creator'), generateCaption);
router.put('/:id', requireRole('Administrator', 'Content Creator'), updatePost);
router.post('/:id/submit', requireRole('Administrator', 'Content Creator'), submitForApproval);
router.post('/:id/schedule', requireRole('Administrator', 'Content Creator'), schedulePost);
router.post('/:id/publish', requireRole('Administrator', 'Content Creator'), publishPost);
router.delete('/:id', requireRole('Administrator', 'Content Creator'), deletePost);

module.exports = router;
