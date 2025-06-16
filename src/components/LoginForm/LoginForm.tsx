import { useState, FormEvent } from 'react';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
}

export const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.media}>
        {/* TODO: Add brand image from branding assets */}
        <img src="/brand/logo.svg" alt="Kubic IQ Logo" className={styles.logo} />
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Welcome to Kubic IQ</h1>
        
        <p className={styles.info}>
          Sign in to access your personalized SAT prep experience
        </p>

        <div className={styles.inputGroup}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className={styles.links}>
          <a href="/forgot-password" className={styles.link}>
            Forgot password?
          </a>
          <a href="/signup" className={styles.link}>
            Create account
          </a>
        </div>
      </form>
    </div>
  );
};
