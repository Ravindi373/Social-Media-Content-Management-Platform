# SMCMP — Social Media Content Management Platform

**Client:** Serene Bay Resort & Kitchen (boutique hotel with an in-house restaurant)
CCS4360 – Techniques in Social Media

A full-stack platform for planning, drafting, reviewing, and publishing social media content across two brand streams — hotel (rooms, packages, events) and restaurant (dishes, promotions, chef specials) — with role-based access control and a real content approval workflow.

This repo contains two apps plus supporting documentation:

- **`backend/`** — Express + Sequelize + MySQL REST API
- **`frontend/`** — React (Vite) app with role-based routing
- **`docs/`** — System design doc (ERD, roles matrix) + clickable wireframe prototype

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Roles & Permissions](#user-roles--permissions)
- [Content Approval Workflow](#content-approval-workflow)
- [Quick Start](#quick-start)
- [Sample Login Credentials](#sample-login-credentials)
- [Repo Structure](#repo-structure)
- [API Overview](#api-overview)
- [Bonus Features](#bonus-features)
- [Automated Testing](#automated-testing)
- [Deployment](#deployment)
- [Project Documents](#project-documents)
- [Team Contributions](#team-contributions)
- [Notes for the Assignment](#notes-for-the-assignment)

---

## Features

- JWT-based authentication with role checks enforced on **both** frontend and backend
- Three user roles — Administrator, Content Creator, Content Approver — each with a distinct permissions matrix
- Full content lifecycle: Draft → Pending Approval → Approved → Scheduled → Published (with a Rejected branch back to Draft)
- Campaign management to group related posts around an objective
- Analytics dashboard with verified aggregation (summary totals, trends, top posts, per-campaign performance)
- Guest consent logging for hospitality content
- AI-assisted caption generation (Gemini) — bonus
- Real Facebook Page publishing via the Meta Graph API — bonus
- Automated test suites on both frontend and backend, run in CI on every push

## Tech Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend | React + Vite + React Router | Component-based, fast to build role-based views |
| Backend | Node.js + Express | Simple REST API, easy to demo live |
| Database | MySQL + Sequelize ORM | Relational schema demonstrates normalized design |
| Auth | JWT-based login | Standard, easy to implement role checks |

## User Roles & Permissions

| Feature | Administrator | Content Creator | Content Approver |
|---|---|---|---|
| Manage users | Yes | No | No |
| Create / edit posts | Yes | Yes | No |
| Approve / reject posts | Yes | No | Yes |
| Schedule posts | Yes | Yes (after approval) | No |
| Manage campaigns | Yes | Yes (create) | Yes (view) |
| View analytics | Yes | Yes | Yes |
| View strategy page | Yes | Yes | Yes |

Role enforcement happens at two independent layers:
1. **Frontend (UX only):** the sidebar hides links a role shouldn't see, and each route is wrapped in a `RoleRoute` guard that redirects to `/dashboard` if the role isn't allowed — so typing a disallowed URL directly doesn't work either.
2. **Backend (actual access control):** role middleware checks the JWT on every endpoint, independent of the frontend. Bypassing the UI entirely does not bypass this layer.

## Content Approval Workflow

```
Draft → Pending Approval → Approved → Scheduled → Published
                 ↓
             Rejected → back to Draft (with Approver comments)
```

1. A Content Creator drafts a post and submits it for approval.
2. A Content Approver reviews it: approve (moves to scheduling) or reject (returns to draft with comments).
3. Approved posts are scheduled, then published — optionally live, via the Facebook integration below.

Each review is stored as its own **Approval** record, preserving a full revision history rather than a single status flag.

## Quick Start

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env     # fill in your MySQL credentials + a JWT secret
npm run seed              # creates tables and loads sample data
npm run dev                # runs on http://localhost:5000
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env     # defaults to http://localhost:5000/api, adjust if needed
npm run dev                # runs on http://localhost:5173
```

Open `http://localhost:5173` and sign in with one of the seeded accounts below.

## Sample Login Credentials

All accounts use the password `Password123!`.

| Role | Email |
|---|---|
| Administrator | m.perera@serenebay.com |
| Content Creator | n.silva@serenebay.com |
| Content Approver | r.jaya@serenebay.com |

## Repo Structure

```
smcmp/
  backend/
    src/
      config/database.js     Sequelize connection (switches MySQL / PostgreSQL / SQLite)
      models/                 One file per ERD entity + index.js wiring associations
      middleware/auth.js       JWT verification
      middleware/role.js       Role-based access guard
      controllers/             Business logic per resource
      routes/                  Express routers, mounted under /api
      seeders/seed.js          Sample dataset (users, posts, campaigns, approvals, analytics, consent logs)
      app.js                   Express app + middleware
      server.js                DB connection, sync, and server start
  frontend/
    src/
      api/client.js            Axios instance with JWT attached to every request
      context/AuthContext.jsx  Login state, persisted to localStorage
      components/
        Layout.jsx              Sidebar + role-filtered nav + page outlet
        ProtectedRoute.jsx       Redirects to /login if not authenticated
        RoleRoute.jsx            Redirects to /dashboard if role isn't allowed
      pages/
        Login.jsx
        Dashboard.jsx
        CreatePost.jsx           Admin, Content Creator
        Calendar.jsx             Admin, Content Creator
        Approvals.jsx            Admin, Content Approver
        Campaigns.jsx            All roles view; Admin/Creator create; Admin edits
        Analytics.jsx            All roles
        Strategy.jsx             All roles (static reference content)
        Privacy.jsx               All roles
        Users.jsx                 Administrator only
      App.jsx                   Route tree, wraps role-gated routes in RoleRoute
      index.css                 Shared design tokens (same palette as the wireframes)
  docs/
    SMCMP_System_Design.md     ERD, role permissions matrix, page list, approval workflow
    SMCMP_Wireframes.html      Clickable wireframe prototype of all 10 pages
  render.yaml                  Render Blueprint for backend + PostgreSQL
  DEPLOYMENT.md                 Step-by-step deployment guide (Render + Vercel)
  .github/                      CI workflow (runs both test suites on every push)
```

## API Overview

All endpoints are prefixed with `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

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

## Bonus Features

### AI-assisted caption generation

`POST /api/posts/generate-caption` calls **Gemini** to write a caption and suggest hashtags from a short topic, right from the Create Post page. If `GEMINI_API_KEY` isn't set, it falls back to a template-based simulated caption instead of failing, so the feature still demonstrates end-to-end without a real API key.

```
GEMINI_API_KEY=AIzaSy-your-key-here
AI_MODEL=gemini-1.5-flash
```

### Facebook integration (real social media API)

`POST /api/posts/:id/publish` pushes an approved or scheduled post live via the **Meta Graph API**, publishing to a real Facebook Page. If `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN` aren't set, it automatically falls back to a simulated publish (status still changes, but `external_post_id` is prefixed `SIMULATED-`).

```
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
```

`GET /api/posts/integration-status` reports whether each integration is live (`aiCaptionConfigured`, `facebookConfigured`).

*Extending to Instagram:* the same Facebook App can publish to a linked Instagram Business account via a two-step "create container, then publish" flow — not implemented here, but `facebookService.js` is the natural place to add it.

## Automated Testing

**Backend** — `npm test` (in `backend/`): 34 Jest + Supertest tests against an in-memory SQLite database (no MySQL needed).
- `tests/auth.test.js` — login success/failure, token validation
- `tests/posts.test.js` — full post lifecycle end-to-end, plus AI caption generation
- `tests/roles.test.js` — permission checks across users and campaigns
- `tests/analytics.test.js` — hand-verified aggregation math

**Frontend** — `npm test` (in `frontend/`): 10 Vitest + React Testing Library tests.
- `src/context/__tests__/AuthContext.test.jsx` — login/logout state management
- `src/components/__tests__/RoleRoute.test.jsx` — confirms the role guard blocks disallowed roles
- `src/pages/__tests__/Login.test.jsx` — form rendering, submission, and error display

Writing these tests caught a real accessibility bug: form labels in Login, Campaigns, and Users were missing `htmlFor`/`id`. Fixed.

## Deployment

See `DEPLOYMENT.md` at the repo root for the full guide.

- **Backend** → Render, with a managed PostgreSQL database (`render.yaml` Blueprint provided)
- **Frontend** → Vercel (`vercel.json` handles the SPA routing rewrite so client-side routes don't 404 on refresh)
- The database layer (`backend/src/config/database.js`) automatically switches between MySQL (local dev), PostgreSQL (production, via `DATABASE_URL`), and SQLite (tests) — no code changes needed between environments
- `.github/` CI workflow runs both test suites on every push

## Project Documents

- `docs/SMCMP_System_Design.md` — ERD, role permissions matrix, page list, and approval workflow
- `docs/SMCMP_Wireframes.html` — clickable wireframe prototype of all 10 pages. Open directly in a browser, or via a local static server. If published via GitHub Pages, the URL must include the filename (it isn't named `index.html`)

## Team Contributions

Each member owned a full-stack vertical slice — backend, frontend, and tests — rather than splitting purely by layer.

| Member | Focus Area | Backend Contributions | Frontend Contributions | Testing | Other |
|---|---|---|---|---|---|
| **[Member 1 name]** | Authentication, Roles & User Management | `models/User`, `middleware/auth.js` (JWT), `middleware/role.js`, `authController`, `userController`, `/auth` & `/users` routes | `Login.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx`, `RoleRoute.jsx`, `Users.jsx`, `Layout.jsx` (role-filtered sidebar) | `auth.test.js`, `roles.test.js`, `AuthContext.test.jsx`, `RoleRoute.test.jsx`, `Login.test.jsx` | Permissions matrix & seed accounts documentation |
| **[Member 2 name]** | Content Workflow (Posts, Calendar, Approvals) & Bonus Integrations | `models/Post`, `models/Approval`, `postController`, `approvalController`, `/posts` & `/approvals` routes, Gemini AI caption generation, Facebook Graph API publish | `CreatePost.jsx`, `Calendar.jsx`, `Approvals.jsx`, `api/client.js` | `posts.test.js` (full draft → submit → approve → schedule → publish lifecycle) | Approval workflow diagram; AI & Facebook integration setup guides |
| **[Member 3 name]** | Campaigns, Analytics, Consent Logs & Deployment | `models/Campaign`, `models/Analytics`, `models/ConsentLog`, their controllers/routes, multi-database config (MySQL/PostgreSQL/SQLite switch) | `Campaigns.jsx`, `Analytics.jsx`, `Strategy.jsx`, `Privacy.jsx`, `index.css` design tokens | `analytics.test.js` (aggregation math) | `render.yaml`, `DEPLOYMENT.md`, `.github` CI workflow, ERD & wireframes |

## Notes for the Assignment

- `sequelize.sync({ alter: true })` is used instead of hand-written migrations — appropriate for a prototype; worth mentioning as a trade-off if markers ask about migration strategy.
- `hashtags` and `platforms` are stored as comma-separated strings on `Post` for simplicity. Splitting these into proper join tables (`Hashtag`, `Platform`, `PostPlatform`) would push the schema to stricter 3NF — a good stretch goal for extra Database Design marks.
- Passwords are hashed with bcrypt; nothing is ever stored in plain text.
- Content calendar is a sortable list rather than a month grid, to keep the scaffold lean — swapping in a proper calendar grid component is a good UI/UX polish item.
- The Strategy page is static content for the prototype; making it admin-editable (backed by a simple settings table) would be a reasonable stretch goal.
- Image upload is a text field for now (`image_url`) since there's no file storage wired up — swap in a real upload widget for bonus marks.
