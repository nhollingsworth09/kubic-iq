import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TestProvider } from './contexts/TestContext';
import { LoginForm } from './components/LoginForm/LoginForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Loading } from './components/Loading/Loading';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import TestStarter from './components/TestTaking/TestStarter';
import TestPage from './components/TestTaking/TestPage';
import TestResults from './components/TestTaking/TestResults';
import TestDebug from './components/TestTaking/TestDebug';
import QuestionReview from './components/TestTaking/QuestionReview';
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
        />        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
        
        {/* Test Taking Routes */}
        <Route 
          path="/test/start/:testType" 
          element={
            user ? (
              <TestStarter />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/test/question/:questionNumber" 
          element={
            user ? (
              <TestPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />        <Route 
          path="/test/results" 
          element={
            user ? (
              <TestResults />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />        {/* Question Review Route */}
        <Route 
          path="/test/review/:questionNumber" 
          element={
            user ? (
              <QuestionReview />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Test History View Route */}
        <Route 
          path="/test/history/:testId" 
          element={
            user ? (
              <TestResults />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Debug Route for Testing */}
        <Route 
          path="/test/debug" 
          element={
            user ? (
              <TestDebug />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </ErrorBoundary>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <TestProvider>
        <Router>
          <AppRoutes />
        </Router>
      </TestProvider>
    </AuthProvider>  
  );
};
