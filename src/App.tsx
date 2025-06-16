import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm/LoginForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Loading } from './components/Loading/Loading';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './styles/global.css';

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginForm />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </ErrorBoundary>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>  
  );
};
