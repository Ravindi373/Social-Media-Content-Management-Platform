require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Campaign, Post, Approval, Analytics, ConsentLog } = require('../models');

async function seed() {
  await sequelize.sync({ force: true }); // wipes and recreates tables — dev/demo only
  console.log('Tables reset.');

  // ---- Users ----
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const [admin, creator, approver] = await User.bulkCreate([
    { name: 'M. Perera', email: 'm.perera@serenebay.com', password_hash: passwordHash, role: 'Administrator' },
    { name: 'N. Silva', email: 'n.silva@serenebay.com', password_hash: passwordHash, role: 'Content Creator' },
    { name: 'R. Jayasuriya', email: 'r.jaya@serenebay.com', password_hash: passwordHash, role: 'Content Approver' },
  ]);
  console.log('Users seeded.');

  // ---- Campaigns ----
  const [menuLaunch, weekendAwareness, festiveEvent] = await Campaign.bulkCreate([
    { name: 'New Menu Launch', type: 'New Product Launch', objective: 'Promote the new chef\'s tasting menu', start_date: '2026-08-12', end_date: '2026-09-20' },
    { name: 'Weekend Getaway Awareness', type: 'Awareness Campaign', objective: 'Drive off-season weekend bookings', start_date: '2026-09-01', end_date: '2026-09-30' },
    { name: 'Festive Season Promotion', type: 'Event Promotion', objective: 'New Year\'s Eve dinner and stay package', start_date: '2026-11-01', end_date: '2026-12-31' },
  ]);
  console.log('Campaigns seeded.');

  // ---- Posts (8 hotel-focused, 8 restaurant-focused, mixed statuses) ----
  const posts = await Post.bulkCreate([
    // Hotel-focused
    { campaign_id: weekendAwareness.id, created_by: creator.id, caption: 'Deluxe suite, ocean view — wake up to the tide.', image_url: 'suite-ocean-view.jpg', hashtags: '#SereneBay,#OceanView,#WeekendGetaway', platforms: 'Instagram,Facebook', status: 'published' },
    { campaign_id: weekendAwareness.id, created_by: creator.id, caption: 'Book two nights, get a late checkout on us.', image_url: 'late-checkout-promo.jpg', hashtags: '#SereneBay,#WeekendGetaway', platforms: 'Facebook', status: 'published' },
    { campaign_id: weekendAwareness.id, created_by: creator.id, caption: 'Poolside sunset series — golden hour, every evening.', image_url: 'poolside-sunset.jpg', hashtags: '#SereneBay,#Sunset', platforms: 'Instagram', status: 'scheduled', scheduled_date: '2026-09-05', scheduled_time: '17:30:00' },
    { campaign_id: festiveEvent.id, created_by: creator.id, caption: 'Three nights, breakfast included, one unforgettable New Year\'s Eve dinner.', image_url: 'festive-package.jpg', hashtags: '#SereneBay,#NewYearsEve', platforms: 'Facebook', status: 'pending_approval' },
    { campaign_id: null, created_by: creator.id, caption: 'Meet our new spa menu — treatments inspired by the coast.', image_url: 'spa-menu.jpg', hashtags: '#SereneBay,#Spa', platforms: 'Instagram', status: 'draft' },
    { campaign_id: weekendAwareness.id, created_by: admin.id, caption: 'Family suite, kids stay free this September.', image_url: 'family-suite.jpg', hashtags: '#SereneBay,#FamilyGetaway', platforms: 'Facebook,Instagram', status: 'published' },
    { campaign_id: null, created_by: creator.id, caption: 'Behind the scenes: our housekeeping team\'s morning routine.', image_url: 'housekeeping-bts.jpg', hashtags: '#SereneBay,#BehindTheScenes', platforms: 'TikTok', status: 'rejected' },
    { campaign_id: festiveEvent.id, created_by: creator.id, caption: 'Countdown to New Year\'s Eve — rooms going fast.', image_url: 'nye-countdown.jpg', hashtags: '#SereneBay,#NewYearsEve', platforms: 'Instagram,Facebook', status: 'draft' },

    // Restaurant-focused
    { campaign_id: menuLaunch.id, created_by: creator.id, caption: 'Seven courses, one story. Our new tasting menu debuts this Friday.', image_url: 'tasting-menu.jpg', hashtags: '#SereneBay,#ChefsTable', platforms: 'Instagram,TikTok', status: 'pending_approval' },
    { campaign_id: null, created_by: creator.id, caption: 'Sunday brunch just got better — new seafood spread from 12pm.', image_url: 'brunch-seafood.jpg', hashtags: '#SereneBay,#SundayBrunch,#OceanDining', platforms: 'Instagram,Facebook', status: 'scheduled', scheduled_date: '2026-09-02', scheduled_time: '10:00:00' },
    { campaign_id: menuLaunch.id, created_by: creator.id, caption: 'Meet the chef behind the new menu.', image_url: 'chef-profile.jpg', hashtags: '#SereneBay,#MeetTheChef', platforms: 'Instagram', status: 'published' },
    { campaign_id: null, created_by: admin.id, caption: 'Fresh catch of the day, straight from the bay.', image_url: 'catch-of-the-day.jpg', hashtags: '#SereneBay,#FreshCatch', platforms: 'Facebook', status: 'published' },
    { campaign_id: null, created_by: creator.id, caption: 'Our sommelier\'s pick for the week: a coastal white worth trying.', image_url: 'wine-pick.jpg', hashtags: '#SereneBay,#WinePairing', platforms: 'Instagram', status: 'draft' },
    { campaign_id: menuLaunch.id, created_by: creator.id, caption: 'Dessert first? We won\'t tell.', image_url: 'dessert-course.jpg', hashtags: '#SereneBay,#Dessert', platforms: 'Instagram,TikTok', status: 'scheduled', scheduled_date: '2026-09-08', scheduled_time: '19:00:00' },
    { campaign_id: null, created_by: creator.id, caption: 'Rainy day comfort: our slow-braised short rib is back.', image_url: 'short-rib.jpg', hashtags: '#SereneBay,#ComfortFood', platforms: 'Facebook', status: 'published' },
    { campaign_id: null, created_by: creator.id, caption: 'A toast to the weekend — happy hour, 5 to 7.', image_url: 'happy-hour.jpg', hashtags: '#SereneBay,#HappyHour', platforms: 'Instagram,Facebook', status: 'published' },
    { campaign_id: null, created_by: creator.id, caption: 'Kids\' menu, reimagined — still fun, a little more chef-driven.', image_url: 'kids-menu.jpg', hashtags: '#SereneBay,#FamilyDining', platforms: 'Facebook', status: 'draft' },
  ]);
  console.log(`${posts.length} posts seeded.`);

  // ---- Approvals (for pending/rejected/published posts that went through review) ----
  const pending1 = posts.find(p => p.caption.startsWith('Three nights'));
  const pending2 = posts.find(p => p.caption.startsWith('Seven courses'));
  const rejected1 = posts.find(p => p.caption.startsWith('Behind the scenes'));
  const publishedSample = posts.filter(p => p.status === 'published').slice(0, 4);

  await Approval.bulkCreate([
    { post_id: pending1.id, approver_id: null, status: 'pending' },
    { post_id: pending2.id, approver_id: null, status: 'pending' },
    { post_id: rejected1.id, approver_id: approver.id, status: 'rejected', comments: 'Needs staff consent confirmation before posting.', reviewed_at: new Date('2026-08-20') },
    ...publishedSample.map(p => ({ post_id: p.id, approver_id: approver.id, status: 'approved', comments: 'Looks good.', reviewed_at: new Date('2026-08-15') })),
  ]);
  console.log('Approvals seeded.');

  // ---- Analytics (daily snapshots per platform, across ALL published posts) ----
  // Building a real 7-day time series (rather than one flat snapshot) so the
  // "Advanced analytics dashboard" trend chart has genuine history to show.
  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  const allPublished = posts.filter(p => p.status === 'published');
  const analyticsRows = [];
  allPublished.forEach((p, postIndex) => {
    const platformList = p.platforms.split(',');
    platformList.forEach((platform, platIndex) => {
      for (let daysBack = 6; daysBack >= 0; daysBack--) {
        const growth = 7 - daysBack; // 1 (a week ago) up to 7 (today) — simulates organic growth
        const timestamp = daysAgo(daysBack);
        analyticsRows.push({
          post_id: p.id,
          platform,
          likes: 18 * growth + postIndex * 6 + platIndex * 3,
          shares: 3 * growth + postIndex,
          comments: 2 * growth + platIndex,
          reach: 450 * growth + postIndex * 140 + platIndex * 70,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    });
  });
  await Analytics.bulkCreate(analyticsRows);
  console.log(`${analyticsRows.length} analytics rows seeded (7-day history across ${allPublished.length} published posts).`);

  // ---- Consent logs ----
  const brunchPost = posts.find(p => p.caption.startsWith('Sunday brunch'));
  const sunsetPost = posts.find(p => p.caption.startsWith('Poolside sunset'));
  await ConsentLog.bulkCreate([
    { post_id: brunchPost.id, guest_name: 'K. Fernando', consent_given: true, date: '2026-08-28' },
    { post_id: sunsetPost.id, guest_name: 'Guest declined to be named', consent_given: false, date: '2026-08-26' },
  ]);
  console.log('Consent logs seeded.');

  console.log('\nSeed complete. Sample login credentials (all use password: Password123!):');
  console.log('  Administrator     -> m.perera@serenebay.com');
  console.log('  Content Creator   -> n.silva@serenebay.com');
  console.log('  Content Approver  -> r.jaya@serenebay.com');

  await sequelize.close();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
