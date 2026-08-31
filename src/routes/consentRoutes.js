const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { listConsentLogs, createConsentLog } = require('../controllers/consentController');

router.use(verifyToken);

// All roles can view the Privacy & Compliance page
router.get('/', listConsentLogs);

// Administrator and Content Creator log new consent records
router.post('/', requireRole('Administrator', 'Content Creator'), createConsentLog);

module.exports = router;
