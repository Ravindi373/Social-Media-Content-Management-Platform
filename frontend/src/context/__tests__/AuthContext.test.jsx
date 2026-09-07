import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the API client so these tests never touch a real network call.
vi.mock('../../api/client', () => ({
  default: { post: vi.fn() },
}));
import client from '../../api/client';

// A tiny consumer component to exercise the context through its real API,
// the same way any page in the app would use useAuth(). Mirrors how the
// real Login page catches a failed login rather than letting it reject
// unhandled.
function Consumer() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? `${user.name} (${user.role})` : 'no user'}</div>
      <button onClick={() => login('m.perera@serenebay.com', 'Password123!').catch(() => {})}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthContext', () => {
  test('starts with no user when localStorage is empty', () => {
    render(<AuthProvider><Consumer /></AuthProvider>);
    expect(screen.getByTestId('user').textContent).toBe('no user');
  });

  test('login() stores the user and token, and updates context state', async () => {
    client.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        user: { id: 1, name: 'M. Perera', email: 'm.perera@serenebay.com', role: 'Administrator' },
      },
    });

    render(<AuthProvider><Consumer /></AuthProvider>);
    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('M. Perera (Administrator)');
    });
    expect(localStorage.getItem('smcmp_token')).toBe('fake-jwt-token');
    expect(JSON.parse(localStorage.getItem('smcmp_user')).role).toBe('Administrator');
  });

  test('logout() clears the user and localStorage', async () => {
    client.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt-token', user: { id: 1, name: 'M. Perera', role: 'Administrator' } },
    });

    render(<AuthProvider><Consumer /></AuthProvider>);
    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => expect(screen.getByTestId('user').textContent).not.toBe('no user'));

    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('user').textContent).toBe('no user');
    expect(localStorage.getItem('smcmp_token')).toBeNull();
  });

  test('a rejected login leaves the user unauthenticated', async () => {
    client.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });

    render(<AuthProvider><Consumer /></AuthProvider>);
    // login() itself throws — the real Login page catches this, this test
    // just confirms context state doesn't change on failure.
    await userEvent.click(screen.getByText('Login')).catch(() => {});

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('no user');
    });
  });
});
