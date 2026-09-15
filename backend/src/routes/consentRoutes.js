const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { listConsentLogs, createConsentLog, updateConsentLog } = require('../controllers/consentController');

router.use(verifyToken);

// All roles can view the Privacy & Compliance page
router.get('/', listConsentLogs);

// Administrator and Content Approver log new consent records or modify existing ones
router.post('/', requireRole('Administrator', 'Content Approver'), createConsentLog);
router.put('/:id', requireRole('Administrator', 'Content Approver'), updateConsentLog);

module.exports = router;
