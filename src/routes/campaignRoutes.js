const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign,
} = require('../controllers/campaignController');

router.use(verifyToken);

// All roles can view campaigns
router.get('/', listCampaigns);
router.get('/:id', getCampaign);

// Administrator and Content Creator can create; only Administrator edits/deletes
router.post('/', requireRole('Administrator', 'Content Creator'), createCampaign);
router.put('/:id', requireRole('Administrator'), updateCampaign);
router.delete('/:id', requireRole('Administrator'), deleteCampaign);

module.exports = router;
