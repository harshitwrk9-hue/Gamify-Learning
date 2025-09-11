import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { rateLimiter, sanitizeInput, csrfProtection } from '../utils/security';
import ForgotPassword from './ForgotPassword';
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [securityWarnings, setSecurityWarnings] = useState([]);
  const [localError, setLocalError] = useState('');
  
  const { login, error, loading } = useAuth();
  const { t } = useLanguage();


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
    
  
    if (error || localError) {
      setLocalError('');
    }
    
  
    clearTimeout(window.validationTimeout);
    window.validationTimeout = setTimeout(() => {
      validateField(name, value);
    }, 300);
  };

  const validateForm = () => {
    const errors = {};
    const warnings = [];
    
  
    if (!formData.username.trim()) {
      errors.username = t('auth.validation.usernameRequired');
    } else if (formData.username.trim().length < 3) {
      errors.username = t('auth.validation.usernameMinLength');
    } else if (formData.username.includes('@')) {
    
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.username)) {
        errors.username = t('auth.validation.invalidEmail');
      }
    
      if (formData.username.includes('..') || formData.username.startsWith('.') || formData.username.endsWith('.')) {
        warnings.push(t('auth.security.suspiciousEmail'));
      }
    } else {
    
      if (/[<>"'&]/.test(formData.username)) {
        errors.username = t('auth.validation.invalidCharacters');
      }
      if (formData.username.length > 50) {
        errors.username = t('auth.validation.usernameTooLong');
      }
    }
    
  
    if (!formData.password) {
      errors.password = t('auth.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('auth.validation.passwordMinLength');
    } else {
    
      if (formData.password.length > 128) {
        errors.password = t('auth.validation.passwordTooLong');
      }
      if (formData.password === formData.username) {
        warnings.push(t('auth.security.passwordSameAsUsername'));
      }
      if (/^(password|123456|qwerty|admin)$/i.test(formData.password)) {
        warnings.push(t('auth.security.commonPassword'));
      }
    }
    
    setValidationErrors(errors);
    setSecurityWarnings(warnings);
    return Object.keys(errors).length === 0;
  };
  

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          errors.username = t('auth.validation.usernameRequired');
        } else if (value.trim().length < 3) {
          errors.username = t('auth.validation.usernameMinLength');
        } else if (value.includes('@')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.username = t('auth.validation.invalidEmail');
          } else {
            delete errors.username;
          }
        } else {
          delete errors.username;
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = t('auth.validation.passwordRequired');
        } else if (value.length < 6) {
          errors.password = t('auth.validation.passwordMinLength');
        } else {
          delete errors.password;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
  
      const csrfToken = csrfProtection.getToken();
      const result = await login(formData.username, formData.password, rememberMe, csrfToken);
      
      if (result.success) {
    
        setValidationErrors({});
        setLocalError('');
        setSuccessMessage(t('auth.loginSuccess'));
        
    
        setTimeout(() => setSuccessMessage(''), 2000);
        
        onSuccess && onSuccess(result.user);
      } else {
    
        if (result.error) {
    
          if (result.error.includes('locked') || result.error.includes('Too many')) {
            setSecurityStatus({
              isLocked: true,
              attemptsRemaining: 0,
              lockoutTime: extractLockoutTime(result.error)
            });
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
  
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        setLocalError(t('auth.errors.networkError'));
      } else if (error.message.includes('timeout')) {
        setLocalError(t('auth.errors.timeout'));
      } else {
        setLocalError(error.message || t('auth.errors.unexpected'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const extractLockoutTime = (errorMessage) => {
    const match = errorMessage.match(/(\d+)\s+minutes?/);
    return match ? parseInt(match[1]) : 5;
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <div className="form-header">
          <h2>{t('auth.welcomeBack')}</h2>
          <p>{t('auth.signInSubtitle')}</p>
        </div>
        
        {(error || localError) && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{error || localError}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="success-message">
            <FaShieldAlt className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {securityWarnings.length > 0 && (
          <div className="security-warnings">
            <FaExclamationTriangle className="warning-icon" />
            <div className="warnings-content">
              <strong>Security Notice:</strong>
              <ul>
                {securityWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
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
            <label htmlFor="username">{t('auth.emailOrUsername')}</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={t('auth.placeholders.emailOrUsername')}
                className={validationErrors.username ? 'error' : ''}
                disabled={loading || isSubmitting}
                autoComplete="username email"
              />
            </div>
            {validationErrors.username && (
              <span className="field-error">{validationErrors.username}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('auth.placeholders.password')}
                className={validationErrors.password ? 'error' : ''}
                disabled={loading || isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isSubmitting}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
              <span className="remember-me-text">{t('auth.rememberMe')}</span>
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
              t('auth.signIn')
            )}
          </button>
        </form>
        
        <div className="form-footer">
          <div className="forgot-password-link">
            <button 
              type="button" 
              className="link-btn forgot-link"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading || isSubmitting}
            >
              {t('auth.forgotPassword')}
            </button>
          </div>
          <p>
            {t('auth.noAccount')}{' '}
            <button 
              type="button" 
              className="link-btn"
              onClick={onSwitchToRegister}
              disabled={loading || isSubmitting}
            >
              {t('auth.createAccount')}
            </button>
          </p>
        </div>
        
        <ForgotPassword 
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onBackToLogin={() => setShowForgotPassword(false)}
        />
      </div>
    </div>
  );
};

export default LoginForm;