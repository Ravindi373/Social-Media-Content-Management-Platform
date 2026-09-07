// Shared test setup: fresh in-memory SQLite schema + three seeded users
// (one per role), matching the credentials used throughout the real app.
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

async function resetAndSeedUsers() {
  await sequelize.sync({ force: true });
  const passwordHash = await bcrypt.hash('Password123!', 4); // low rounds — speed, not production security
  const [admin, creator, approver] = await User.bulkCreate([
    { name: 'Test Admin', email: 'admin@test.com', password_hash: passwordHash, role: 'Administrator' },
    { name: 'Test Creator', email: 'creator@test.com', password_hash: passwordHash, role: 'Content Creator' },
    { name: 'Test Approver', email: 'approver@test.com', password_hash: passwordHash, role: 'Content Approver' },
  ]);
  return { admin, creator, approver };
}

const request = require('supertest');

async function loginAs(email) {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
  return res.body.token;
}

module.exports = { app, sequelize, resetAndSeedUsers, loginAs, request };
