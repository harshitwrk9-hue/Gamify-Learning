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
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  const handleAuthSuccess = (user) => {
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