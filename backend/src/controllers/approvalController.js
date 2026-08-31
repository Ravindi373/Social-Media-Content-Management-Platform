const { Approval, Post, User } = require('../models');

// GET /api/approvals?status=pending  (Administrator, Content Approver)
async function listApprovals(req, res) {
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const approvals = await Approval.findAll({
    where,
    include: [
      { model: Post, as: 'post' },
      { model: User, as: 'approver', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(approvals);
}

// PUT /api/approvals/:id  (Administrator, Content Approver)
// body: { status: 'approved' | 'rejected', comments }
async function reviewApproval(req, res) {
  const approval = await Approval.findByPk(req.params.id, { include: [{ model: Post, as: 'post' }] });
  if (!approval) return res.status(404).json({ message: 'Approval record not found' });

  const { status, comments } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
  }

  await approval.update({
    status,
    comments,
    approver_id: req.user.id,
    reviewed_at: new Date(),
  });

  // Reflect the decision on the parent post
  await approval.post.update({ status: status === 'approved' ? 'approved' : 'rejected' });

  res.json(approval);
}

module.exports = { listApprovals, reviewApproval };
