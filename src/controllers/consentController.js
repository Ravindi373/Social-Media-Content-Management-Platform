const { ConsentLog, Post } = require('../models');

// GET /api/consent-logs  (all roles — Privacy & Compliance page)
async function listConsentLogs(req, res) {
  const logs = await ConsentLog.findAll({
    include: [{ model: Post, as: 'post', attributes: ['id', 'caption'] }],
    order: [['date', 'DESC']],
  });
  res.json(logs);
}

// POST /api/consent-logs  (Administrator, Content Creator)
async function createConsentLog(req, res) {
  try {
    const { post_id, guest_name, consent_given, date } = req.body;
    const log = await ConsentLog.create({ post_id, guest_name, consent_given, date });
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ message: 'Could not create consent log', error: err.message });
  }
}

module.exports = { listConsentLogs, createConsentLog };
