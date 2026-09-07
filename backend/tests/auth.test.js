const { app, sequelize, resetAndSeedUsers, request } = require('./helpers');

beforeAll(async () => {
  await resetAndSeedUsers();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/login', () => {
  test('succeeds with correct credentials and returns a token + role', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Administrator');
  });

  test('rejects an unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(401);
  });

  test('rejects the correct email with the wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  test('rejects a missing password entirely', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  test('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns the current user when a valid token is supplied', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'creator@test.com',
      password: 'Password123!',
    });
    const token = loginRes.body.token;

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe('creator@test.com');
    expect(meRes.body.role).toBe('Content Creator');
  });
});
