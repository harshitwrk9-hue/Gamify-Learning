import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { rateLimiter, sanitizeInput } from '../utils/security';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({
    attemptsRemaining: null,
    isLocked: false,
    lockoutTime: 0
  });
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, error, loading } = useAuth();

  // Check security status when username changes
  useEffect(() => {
    if (formData.username.trim()) {
      const sanitizedUsername = sanitizeInput.username(formData.username);
      const rateLimitCheck = rateLimiter.checkRateLimit(sanitizedUsername);
      
      setSecurityStatus({
        attemptsRemaining: rateLimitCheck.attemptsRemaining || 0,
        isLocked: !rateLimitCheck.allowed,
        lockoutTime: rateLimitCheck.remainingTime || 0
      });
    } else {
      setSecurityStatus({
        attemptsRemaining: null,
        isLocked: false,
        lockoutTime: 0
      });
    }
  }, [formData.username]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.username, formData.password, rememberMe);
      
      if (result.success) {
        onSuccess && onSuccess(result.user);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <div className="form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue your learning journey</p>
        </div>
        
        {error && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
        
        {securityStatus.isLocked && (
          <div className="security-warning locked">
            <FaShieldAlt className="security-icon" />
            <div className="security-content">
              <strong>Account Temporarily Locked</strong>
              <p>Too many failed login attempts. Please try again in {securityStatus.lockoutTime} minutes.</p>
            </div>
          </div>
        )}
        
        {!securityStatus.isLocked && securityStatus.attemptsRemaining !== null && securityStatus.attemptsRemaining <= 2 && (
          <div className="security-warning attempts">
            <FaExclamationTriangle className="security-icon" />
            <div className="security-content">
              <strong>Security Notice</strong>
              <p>{securityStatus.attemptsRemaining} login attempts remaining before temporary lockout.</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className={validationErrors.username ? 'error' : ''}
                disabled={loading || isSubmitting}
                autoComplete="username"
              />
            </div>
            {validationErrors.username && (
              <span className="field-error">{validationErrors.username}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={validationErrors.password ? 'error' : ''}
                disabled={loading || isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>
          
          <div className="form-group remember-me-group">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading || isSubmitting}
                className="remember-me-checkbox"
              />
              <span className="checkmark"></span>
              <span className="remember-me-text">Remember me for 30 days</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || isSubmitting || securityStatus.isLocked}
          >
            {securityStatus.isLocked ? (
              <>
                <FaShieldAlt />
                Account Locked
              </>
            ) : (loading || isSubmitting) ? (
              <>
                <FaSpinner className="spinner" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="form-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-btn"
              onClick={onSwitchToRegister}
              disabled={loading || isSubmitting}
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;