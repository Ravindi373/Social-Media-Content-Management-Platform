const { app, sequelize, resetAndSeedUsers, loginAs, request } = require('./helpers');

let adminToken, creatorToken, approverToken;

beforeAll(async () => {
  await resetAndSeedUsers();
  adminToken = await loginAs('admin@test.com');
  creatorToken = await loginAs('creator@test.com');
  approverToken = await loginAs('approver@test.com');
});

afterAll(async () => {
  await sequelize.close();
});

describe('User management — Administrator only', () => {
  test('Administrator can list users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('Content Creator cannot list users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(403);
  });

  test('Content Approver cannot list users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${approverToken}`);
    expect(res.status).toBe(403);
  });

  test('Administrator can create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Person', email: 'newperson@test.com', password: 'Password123!', role: 'Content Creator' });
    expect(res.status).toBe(201);
  });
});

describe('Campaign permissions', () => {
  let campaignId;

  test('all roles can view campaigns', async () => {
    for (const token of [adminToken, creatorToken, approverToken]) {
      const res = await request(app).get('/api/campaigns').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    }
  });

  test('Content Creator can create a campaign', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ name: 'Test Campaign', type: 'Awareness Campaign' });
    expect(res.status).toBe(201);
    campaignId = res.body.id;
  });

  test('Content Approver cannot create a campaign', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ name: 'Should fail', type: 'Awareness Campaign' });
    expect(res.status).toBe(403);
  });

  test('Content Creator cannot delete a campaign (Administrator only)', async () => {
    const res = await request(app)
      .delete(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(403);
  });

  test('Administrator can delete a campaign', async () => {
    const res = await request(app)
      .delete(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
