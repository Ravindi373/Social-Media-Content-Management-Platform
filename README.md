# SMCMP Frontend — React + React Router

React frontend for the Social Media Content Management Platform (Serene Bay Resort & Kitchen).
Pages and role-based navigation match the wireframes and the backend API's permissions matrix.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your running backend, default http://localhost:5000/api
npm run dev            # starts on http://localhost:5173
```

Run the backend (`smcmp-backend`) and its seed script first so there's data and login accounts to use.

## Sample login credentials (from the backend seed script)

All accounts use the password `Password123!`.

| Role | Email |
|---|---|
| Administrator | m.perera@serenebay.com |
| Content Creator | n.silva@serenebay.com |
| Content Approver | r.jaya@serenebay.com |

## Project structure

```
src/
  api/client.js           Axios instance with JWT attached to every request
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
```

## How role-based routing works

1. `AuthContext` stores the logged-in user's `role` from the login response.
2. `Layout.jsx` filters the sidebar links by role before rendering them, so a
   Content Approver never even sees a "Create post" link.
3. `App.jsx` wraps the actual route (not just the link) in `<RoleRoute allow={[...]} />`,
   so typing a disallowed URL directly redirects to the dashboard instead of rendering
   the page. Navigation and route protection are enforced independently — hiding a
   link is a UX nicety, not the security boundary.
4. The backend enforces the same roles again on every endpoint, so the frontend
   checks are for UX only, not the actual access control.

## Notes for the assignment

- Content calendar is a sortable list rather than a month grid, to keep the scaffold
  lean — swapping in a proper calendar grid component is a good UI/UX polish item.
- The Strategy page is static content for the prototype; making it admin-editable
  (backed by a simple settings table) would be a reasonable stretch goal.
- Image upload is a text field for now (`image_url`) since there's no file storage
  wired up — swap in a real upload widget if you want the bonus marks for that.
