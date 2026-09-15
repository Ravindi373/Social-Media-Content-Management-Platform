const { ConsentLog, Post, User } = require('../models');

// GET /api/consent-logs  (all roles — Privacy & Compliance page)
async function listConsentLogs(req, res) {
  const logs = await ConsentLog.findAll({
    include: [
      { model: Post, as: 'post', attributes: ['id', 'caption'] },
      { model: User, as: 'editor', attributes: ['id', 'name', 'role'] }
    ],
    order: [['date', 'DESC']],
  });
  res.json(logs);
}

// POST /api/consent-logs  (Administrator, Content Approver)
async function createConsentLog(req, res) {
  try {
    const { post_id, guest_name, consent_given, date } = req.body;
    const log = await ConsentLog.create({ 
      post_id: post_id || null, 
      guest_name, 
      consent_given, 
      date,
      last_edited_by: req.user.id 
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ message: 'Could not create consent log', error: err.message });
  }
}

// PUT /api/consent-logs/:id (Administrator, Content Approver)
async function updateConsentLog(req, res) {
  try {
    const log = await ConsentLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Consent log not found' });

    const { post_id, guest_name, consent_given, date } = req.body;
    await log.update({
      post_id: post_id || null,
      guest_name,
      consent_given,
      date,
      last_edited_by: req.user.id
    });
    res.json(log);
  } catch (err) {
    res.status(400).json({ message: 'Could not update consent log', error: err.message });
  }
}

module.exports = { listConsentLogs, createConsentLog, updateConsentLog };
