# SMCMP Backend — Express + Sequelize + MySQL

Backend API for the Social Media Content Management Platform (Serene Bay Resort & Kitchen).
Matches the ERD and role permissions matrix from the system design document.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your MySQL credentials and a JWT secret
```

Create an empty MySQL database matching `DB_NAME` in your `.env` (e.g. `CREATE DATABASE smcmp;`).

```bash
npm run seed   # creates tables and loads sample users/posts/campaigns (17 posts total)
npm run dev    # starts the API on http://localhost:5000 with nodemon
```

## Sample login credentials (from the seed script)

All accounts use the password `Password123!`.

| Role | Email |
|---|---|
| Administrator | m.perera@serenebay.com |
| Content Creator | n.silva@serenebay.com |
| Content Approver | r.jaya@serenebay.com |

## Project structure

```
src/
  config/database.js     Sequelize connection
  models/                One file per ERD entity + index.js wiring associations
  middleware/auth.js      JWT verification
  middleware/role.js      Role-based access guard
  controllers/            Business logic per resource
  routes/                 Express routers, mounted under /api
  seeders/seed.js         Sample dataset (users, posts, campaigns, approvals, analytics, consent logs)
  app.js                  Express app + middleware
  server.js               DB connection, sync, and server start
```

## API overview

All endpoints are prefixed with `/api`. Authenticated routes expect
`Authorization: Bearer <token>`.

| Method | Route | Roles |
|---|---|---|
| POST | /auth/login | Public |
| GET | /auth/me | Any authenticated user |
| GET/POST/PUT/DELETE | /users | Administrator only |
| GET | /posts, /posts/:id | Any authenticated user |
| POST/PUT/DELETE | /posts | Administrator, Content Creator |
| POST | /posts/:id/submit | Administrator, Content Creator |
| POST | /posts/:id/schedule | Administrator, Content Creator |
| GET | /approvals | Administrator, Content Approver |
| PUT | /approvals/:id | Administrator, Content Approver |
| GET | /campaigns, /campaigns/:id | Any authenticated user |
| POST | /campaigns | Administrator, Content Creator |
| PUT/DELETE | /campaigns/:id | Administrator only |
| GET | /analytics, /analytics/summary | Any authenticated user |
| POST | /analytics | Administrator only |
| GET | /consent-logs | Any authenticated user |
| POST | /consent-logs | Administrator, Content Creator |

## Facebook integration (bonus: real social media API)

`POST /api/posts/:id/publish` pushes an approved or scheduled post live via
the **Meta Graph API**, publishing to a real Facebook Page you administer.
If `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN` aren't set in `.env`,
it automatically falls back to a **simulated** publish (status still changes,
but `external_post_id` is prefixed `SIMULATED-`) so the feature still
demonstrates end-to-end without a real developer app.

### Getting real credentials (~10 minutes)

1. Go to [developers.facebook.com](https://developers.facebook.com/), sign
   in, and click **My Apps → Create App**. Choose "Other" as the use case,
   then "Business" as the app type.
2. In your Facebook account, create a Page you administer (Settings → Create
   Page, or use an existing one) if you don't already have one — this can be
   a plain test page, it doesn't need to be public.
3. Back in the Meta App dashboard, go to **Tools → Graph API Explorer**.
   Select your app from the dropdown, then select your Page under "User or
   Page" — this gives you a Page Access Token.
4. Under "Permissions", request `pages_manage_posts` and `pages_read_engagement`.
   Because you're the app's admin/developer testing on your own Page, this
   works immediately in **Development Mode** — no App Review needed.
5. Copy the generated access token and your Page's numeric ID (visible on
   the Page's About section, or via `GET /me/accounts` in the Explorer) into
   your `.env`:
   ```
   FACEBOOK_PAGE_ID=your_page_id
   FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
   ```
6. Restart the backend. `GET /api/posts/integration-status` should now
   return `{ "facebookConfigured": true }`, and publishing a post will
   actually appear on your Facebook Page.

Note: tokens from Graph API Explorer expire in about an hour by default.
For anything longer-lived, exchange it for a long-lived Page token (Meta's
docs cover this under "Access Tokens" — not required for a demo, since
you can just regenerate one before recording your video).

### Extending to Instagram

The same Facebook App can publish to an Instagram Business account linked
to your Page, via a two-step "create container, then publish" flow on
`/{ig-user-id}/media` and `/{ig-user-id}/media_publish`. Not implemented
here to keep the scope focused, but it's a natural next step if you want to
push the bonus further — the existing `facebookService.js` module is the
right place to add it.

## Notes for the assignment

- `sequelize.sync({ alter: true })` is used instead of hand-written migrations —
  appropriate for a prototype; mention this trade-off in your documentation if
  markers ask about migration strategy.
- `hashtags` and `platforms` are stored as comma-separated strings on `Post` for
  simplicity. Splitting these into proper join tables (`Hashtag`, `Platform`,
  `PostPlatform`) would push the schema to stricter 3NF — a good stretch goal
  for extra Database Design marks.
- Passwords are hashed with bcrypt; nothing is ever stored in plain text.
