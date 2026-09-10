# SMCMP - Social Media Content Management Platform

CCS4360 – Techniques in Social Media - Group Assignment

Client: Serene Bay Resort & Kitchen (Hotel/Restaurant)

This repo contains two apps:

- **`backend/`** - Express + Sequelize + MySQL REST API
- **`frontend/`** - React (Vite) app with role-based routing

Each has its own README with full setup instructions. Quick start below.

## Quick start

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env     # fill in your MySQL credentials + a JWT secret
   npm run seed             # creates tables and loads sample data
   npm run dev              # runs on http://localhost:5000
   ```

2. **Frontend** (in a second terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env     # defaults to http://localhost:5000/api, adjust if needed
   npm run dev              # runs on http://localhost:5173
   ```

3. Open `http://localhost:5173` and sign in with one of the seeded accounts
   (all use the password `Password123!`):

   | Role | Email |
   |---|---|
   | Administrator | m.perera@serenebay.com |
   | Content Creator | n.silva@serenebay.com |
   | Content Approver | r.jaya@serenebay.com |

## Project documents

`docs/SMCMP_System_Design.md` - ERD, role permissions matrix, page list, and
approval workflow.

`docs/SMCMP_Wireframes.html` - clickable wireframe prototype of all 10 pages.
Open it directly in a browser (double-click, or a local static server). If
you publish it via GitHub Pages, the URL must include the filename, e.g.
`https://yourname.github.io/repo/docs/SMCMP_Wireframes.html`, since it isn't
named `index.html`.

## Repo structure

```
smcmp/
  backend/     Express API — models, controllers, routes, seed script
  frontend/    React app — pages, routing by role, API client
  docs/        System design doc + wireframe prototype
  .nojekyll    Disables Jekyll processing if you enable GitHub Pages
  README.md    You are here
```

