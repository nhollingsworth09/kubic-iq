import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the AuthContext
const mockLogin = jest.fn();
const mockAuthContextValue = {
  user: null,
  login: mockLogin,
  logout: jest.fn(),
  isLoading: false,
  error: null,
};

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => mockAuthContextValue,
}));

const LoginFormWrapper = () => (
  <AuthProvider>
    <LoginForm />
  </AuthProvider>
);

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginFormWrapper />);
    
    expect(screen.getByText('Master Your Future')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your account and continue learning.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<LoginFormWrapper />);
    
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('Show password');
    
    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('handles form submission', async () => {
    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays loading state', () => {
    const loadingAuthContextValue = {
      ...mockAuthContextValue,
      isLoading: true,
    };
    
    jest.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue(loadingAuthContextValue);
    
    render(<LoginFormWrapper />);
    
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });

  it('displays error message', () => {
    const errorAuthContextValue = {
      ...mockAuthContextValue,
      error: 'Invalid credentials',
    };
    
    jest.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue(errorAuthContextValue);
    
    render(<LoginFormWrapper />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');  });
});

export {};
