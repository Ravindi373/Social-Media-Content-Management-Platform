const { Campaign, Post } = require('../models');

// GET /api/campaigns  (all roles)
async function listCampaigns(req, res) {
  const campaigns = await Campaign.findAll({
    include: [{ model: Post, as: 'posts', attributes: ['id', 'status'] }],
    order: [['start_date', 'DESC']],
  });
  res.json(campaigns);
}

// GET /api/campaigns/:id
async function getCampaign(req, res) {
  const campaign = await Campaign.findByPk(req.params.id, {
    include: [{ model: Post, as: 'posts' }],
  });
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
  res.json(campaign);
}

// POST /api/campaigns  (Administrator, Content Creator)
async function createCampaign(req, res) {
  try {
    const { name, type, objective, start_date, end_date } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'name and type are required' });

    const campaign = await Campaign.create({ name, type, objective, start_date, end_date });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: 'Could not create campaign', error: err.message });
  }
}

// PUT /api/campaigns/:id  (Administrator only)
async function updateCampaign(req, res) {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const { name, type, objective, start_date, end_date } = req.body;
  await campaign.update({ name, type, objective, start_date, end_date });
  res.json(campaign);
}

// DELETE /api/campaigns/:id  (Administrator only)
async function deleteCampaign(req, res) {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
  await campaign.destroy();
  res.json({ message: 'Campaign deleted' });
}

module.exports = { listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign };
