const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { listAnalytics, summary, recordAnalytics } = require('../controllers/analyticsController');

router.use(verifyToken);

// All roles can view the analytics dashboard
router.get('/', listAnalytics);
router.get('/summary', summary);

// Only Administrator records/updates analytics figures
router.post('/', requireRole('Administrator'), recordAnalytics);

module.exports = router;
