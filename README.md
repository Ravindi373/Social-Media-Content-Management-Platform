# SMCMP — Social Media Content Management Platform

CCS4360 – Techniques in Social Media — Group Assignment
Client: Serene Bay Resort & Kitchen (Hotel/Restaurant)

This repo contains two apps:

- **`backend/`** — Express + Sequelize + MySQL REST API
- **`frontend/`** — React (Vite) app with role-based routing

Each has its own README with full setup instructions. Quick start below.

## Quick start

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # fill in your MySQL credentials + a JWT secret
   npm run seed            # creates tables and loads sample data
   npm run dev              # runs on http://localhost:5000
   ```

2. **Frontend** (in a second terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
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

If you're including the system design document and wireframes in this repo
too, a `docs/` folder alongside `frontend/` and `backend/` is a reasonable
place for `SMCMP_System_Design.md` and `SMCMP_Wireframes.html`.

## Repo structure

```
smcmp/
  backend/     Express API — models, controllers, routes, seed script
  frontend/    React app — pages, routing by role, API client
  README.md    You are here
```
