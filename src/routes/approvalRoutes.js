const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { listApprovals, reviewApproval } = require('../controllers/approvalController');

// Approval queue — Administrator, Content Approver only
router.use(verifyToken, requireRole('Administrator', 'Content Approver'));

router.get('/', listApprovals);
router.put('/:id', reviewApproval);

module.exports = router;
