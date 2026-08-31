const bcrypt = require('bcryptjs');
const { User } = require('../models');

// GET /api/users  (Administrator only)
async function listUsers(req, res) {
  const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
  res.json(users);
}

// POST /api/users  (Administrator only)
async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: 'Could not create user', error: err.message });
  }
}

// PUT /api/users/:id  (Administrator only)
async function updateUser(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role } = req.body;
    await user.update({ name, email, role });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: 'Could not update user', error: err.message });
  }
}

// DELETE /api/users/:id  (Administrator only)
async function deleteUser(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.destroy();
  res.json({ message: 'User removed' });
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
