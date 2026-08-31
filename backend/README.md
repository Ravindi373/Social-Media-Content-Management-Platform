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
npm run seed   # creates tables and loads sample users/posts/campaigns (18 posts total)
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

## Notes for the assignment

- `sequelize.sync({ alter: true })` is used instead of hand-written migrations —
  appropriate for a prototype; mention this trade-off in your documentation if
  markers ask about migration strategy.
- `hashtags` and `platforms` are stored as comma-separated strings on `Post` for
  simplicity. Splitting these into proper join tables (`Hashtag`, `Platform`,
  `PostPlatform`) would push the schema to stricter 3NF — a good stretch goal
  for extra Database Design marks.
- Passwords are hashed with bcrypt; nothing is ever stored in plain text.
