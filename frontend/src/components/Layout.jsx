import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sidebar links, each tagged with the roles allowed to see it —
// mirrors the permissions matrix in the system design doc.
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['Administrator', 'Content Creator', 'Content Approver'] },
  { to: '/posts/new', label: 'Create / edit post', roles: ['Administrator', 'Content Creator'] },
  { to: '/calendar', label: 'Content calendar', roles: ['Administrator', 'Content Creator'] },
  { to: '/approvals', label: 'Approval queue', roles: ['Administrator', 'Content Approver'] },
  { to: '/campaigns', label: 'Campaigns', roles: ['Administrator', 'Content Creator', 'Content Approver'] },
  { to: '/analytics', label: 'Analytics', roles: ['Administrator', 'Content Creator', 'Content Approver'] },
  { to: '/strategy', label: 'Strategy', roles: ['Administrator', 'Content Creator', 'Content Approver'] },
  { to: '/privacy', label: 'Privacy & compliance', roles: ['Administrator', 'Content Creator', 'Content Approver'] },
  { to: '/users', label: 'User management', roles: ['Administrator'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="app-shell">
      {/* Mobile-only top bar with hamburger — hidden at desktop widths via CSS */}
      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setNavOpen(true)} aria-label="Open menu">☰</button>
        <div className="brand-mark"><span className="dot" /><span>SERENE BAY</span></div>
        <div className="spacer" />
      </div>

      {/* Tapping the backdrop closes the drawer on mobile; invisible/inert on desktop */}
      <div className={`nav-backdrop ${navOpen ? 'open' : ''}`} onClick={closeNav} />

      <aside className={navOpen ? 'open' : ''}>
        <button className="close-btn" onClick={closeNav} aria-label="Close menu">✕</button>
        <div className="brand-mark"><span className="dot" /><span>SERENE BAY</span></div>
        <div className="role-switch">
          <label>Signed in as</label>
          <div className="role-name">{user.name}</div>
          <div className="role-tag">{user.role}</div>
        </div>
        <nav className="pages">
          {NAV_ITEMS.filter((item) => item.roles.includes(user.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeNav}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="signout">
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
