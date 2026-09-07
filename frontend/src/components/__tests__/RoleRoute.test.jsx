import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleRoute from '../RoleRoute';

// Mock useAuth so each test can control the "logged in as" role directly.
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from '../../context/AuthContext';

function renderWithRole(role, allow) {
  useAuth.mockReturnValue({ user: role ? { role } : null });
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<RoleRoute allow={allow} />}>
          <Route path="/protected" element={<div>Protected content</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RoleRoute', () => {
  test('renders the protected content when the user\'s role is allowed', () => {
    renderWithRole('Administrator', ['Administrator', 'Content Creator']);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  test('redirects to /dashboard when the role is not allowed', () => {
    renderWithRole('Content Approver', ['Administrator', 'Content Creator']);
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  test('redirects to /login when there is no user at all', () => {
    renderWithRole(null, ['Administrator']);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
