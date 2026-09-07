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

describe('Post creation permissions', () => {
  test('Content Creator can create a draft post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ caption: 'Test draft post', platforms: 'Instagram' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
  });

  test('Content Approver cannot create a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ caption: 'Should be rejected' });
    expect(res.status).toBe(403);
  });

  test('a request with no token is rejected', async () => {
    const res = await request(app).post('/api/posts').send({ caption: 'No auth' });
    expect(res.status).toBe(401);
  });

  test('creating a post with no caption fails validation', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ platforms: 'Instagram' });
    expect(res.status).toBe(400);
  });
});

describe('Full post lifecycle: draft → submit → approve → schedule → publish', () => {
  let postId;

  test('Content Creator creates a draft', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ caption: 'Lifecycle test post', platforms: 'Facebook' });
    expect(res.body.status).toBe('draft');
    postId = res.body.id;
  });

  test('submitting moves it to pending_approval', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/submit`)
      .set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending_approval');
  });

  test('Content Approver can see it in the approval queue', async () => {
    const res = await request(app)
      .get('/api/approvals?status=pending')
      .set('Authorization', `Bearer ${approverToken}`);
    expect(res.status).toBe(200);
    const match = res.body.find((a) => a.post_id === postId);
    expect(match).toBeDefined();
  });

  test('approving it moves the post to approved status', async () => {
    const approvalsRes = await request(app)
      .get('/api/approvals?status=pending')
      .set('Authorization', `Bearer ${approverToken}`);
    const approvalRecord = approvalsRes.body.find((a) => a.post_id === postId);

    const res = await request(app)
      .put(`/api/approvals/${approvalRecord.id}`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ status: 'approved', comments: 'Looks good' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');

    const postRes = await request(app)
      .get(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(postRes.body.status).toBe('approved');
  });

  test('scheduling requires a date and time', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/schedule`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('scheduling with a date and time moves it to scheduled', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/schedule`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ scheduled_date: '2026-12-25', scheduled_time: '10:00:00' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('scheduled');
  });

  test('publishing moves it to published and simulates without Facebook credentials', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/publish`)
      .set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.post.status).toBe('published');
    expect(res.body.simulated).toBe(true);
    expect(res.body.post.external_post_id).toMatch(/^SIMULATED-/);
  });

  test('a draft post cannot be published directly', async () => {
    const draftRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ caption: 'Still a draft', platforms: 'Instagram' });

    const res = await request(app)
      .post(`/api/posts/${draftRes.body.id}/publish`)
      .set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(400);
  });
});

describe('AI caption generation', () => {
  test('Content Approver cannot generate a caption', async () => {
    const res = await request(app)
      .post('/api/posts/generate-caption')
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ topic: 'test' });
    expect(res.status).toBe(403);
  });

  test('Content Creator gets a simulated caption without an API key configured', async () => {
    const res = await request(app)
      .post('/api/posts/generate-caption')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ topic: 'new seafood brunch menu', platform: 'Instagram', tone: 'warm and inviting' });
    expect(res.status).toBe(200);
    expect(res.body.simulated).toBe(true);
    expect(typeof res.body.caption).toBe('string');
    expect(Array.isArray(res.body.hashtags)).toBe(true);
  });

  test('missing topic returns a 400', async () => {
    const res = await request(app)
      .post('/api/posts/generate-caption')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
