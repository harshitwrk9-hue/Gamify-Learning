import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, clearError } = useAuth();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  useEffect(() => {
    // Clear any existing errors when switching between forms
    clearError();
  }, [isLogin, clearError]);

  const handleAuthSuccess = (user) => {
    // Navigate to the intended destination or dashboard
    navigate(from, { replace: true });
  };

  const switchToLogin = () => {
    setIsLogin(true);
    clearError();
  };

  const switchToRegister = () => {
    setIsLogin(false);
    clearError();
  };

  // Don't render if user is already authenticated
  if (currentUser) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;