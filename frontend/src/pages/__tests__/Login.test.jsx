import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  test('renders email and password fields and a sign in button', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('calls login() with the typed credentials on submit', async () => {
    mockLogin.mockResolvedValueOnce({ role: 'Administrator' });
    renderLogin();

    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('m.perera@serenebay.com', 'Password123!');
    });
  });

  test('shows an error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce({ response: { data: { message: 'Invalid email or password' } } });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
