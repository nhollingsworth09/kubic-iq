import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginForm.module.css';

export const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.media}>
        <img src="/brand/logo.svg" alt="Kubic IQ Logo" className={styles.logo} />
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Welcome to Kubic IQ</h1>
        
        <p className={styles.info}>
          Sign in to access your personalized SAT prep experience
        </p>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

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
