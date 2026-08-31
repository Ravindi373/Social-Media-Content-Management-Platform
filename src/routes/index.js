const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/approvals', require('./approvalRoutes'));
router.use('/campaigns', require('./campaignRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/consent-logs', require('./consentRoutes'));

module.exports = router;
