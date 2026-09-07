const { app, sequelize, resetAndSeedUsers, loginAs, request } = require('./helpers');
const { Post, Campaign, Analytics } = require('../src/models');

let adminToken;
let postA, postB;

beforeAll(async () => {
  const { creator } = await resetAndSeedUsers();
  adminToken = await loginAs('admin@test.com');

  const campaign = await Campaign.create({ name: 'Test Campaign', type: 'Awareness Campaign' });

  postA = await Post.create({
    caption: 'High performer', platforms: 'Instagram', status: 'published',
    created_by: creator.id, campaign_id: campaign.id,
  });
  postB = await Post.create({
    caption: 'Low performer', platforms: 'Facebook', status: 'published',
    created_by: creator.id, campaign_id: null,
  });

  // Two days of history for postA, one day for postB — a real (small) time series.
  await Analytics.bulkCreate([
    { post_id: postA.id, platform: 'Instagram', likes: 100, shares: 20, comments: 10, reach: 1000, createdAt: '2026-01-01' },
    { post_id: postA.id, platform: 'Instagram', likes: 200, shares: 40, comments: 20, reach: 2000, createdAt: '2026-01-02' },
    { post_id: postB.id, platform: 'Facebook', likes: 10, shares: 2, comments: 1, reach: 500, createdAt: '2026-01-02' },
  ]);
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/analytics/summary', () => {
  test('correctly sums totals and computes engagement rate', async () => {
    const res = await request(app).get('/api/analytics/summary').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.likes).toBe(310); // 100 + 200 + 10
    expect(res.body.reach).toBe(3500); // 1000 + 2000 + 500
    // engagementRate = (likes+shares+comments)/reach * 100, rounded to 2dp
    const expectedRate = Math.round(((310 + 62 + 31) / 3500) * 10000) / 100;
    expect(res.body.engagementRate).toBe(expectedRate);
  });
});

describe('GET /api/analytics/trend', () => {
  test('groups by day and returns 2 distinct days', async () => {
    const res = await request(app).get('/api/analytics/trend').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    const day2 = res.body.find((d) => d.day === '2026-01-02');
    expect(day2.reach).toBe(2500); // postA's 2000 + postB's 500 on the same day
  });
});

describe('GET /api/analytics/top-posts', () => {
  test('ranks postA above postB by total reach', async () => {
    const res = await request(app).get('/api/analytics/top-posts').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe(postA.id);
    expect(res.body[0].reach).toBe(3000); // 1000 + 2000
  });
});

describe('GET /api/analytics/by-campaign', () => {
  test('separates campaign-linked reach from "No campaign" reach', async () => {
    const res = await request(app).get('/api/analytics/by-campaign').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const withCampaign = res.body.find((c) => c.campaign === 'Test Campaign');
    const noCampaign = res.body.find((c) => c.campaign === 'No campaign');
    expect(withCampaign.reach).toBe(3000);
    expect(noCampaign.reach).toBe(500);
  });
});
