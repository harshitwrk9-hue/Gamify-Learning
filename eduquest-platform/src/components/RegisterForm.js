import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateUsername, validatePassword } from '../utils/auth';
import { sanitizeInput, passwordStrength, securityLogger } from '../utils/security';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import './RegisterForm.css';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrengthInfo, setPasswordStrengthInfo] = useState(null);
  
  const { register, error, loading } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue;
    if (name === 'username') {
      sanitizedValue = sanitizeInput.username(value);
    } else if (name === 'password' || name === 'confirmPassword') {
      sanitizedValue = sanitizeInput.password(value);
    } else {
      sanitizedValue = sanitizeInput.text(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Update password strength analysis
    if (name === 'password') {
      const strength = passwordStrength.analyze(sanitizedValue);
      setPasswordStrengthInfo(strength);
    }
    
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
    
    // Validate username
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.messages[0];
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.messages[0];
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      // Log registration attempt
      securityLogger.log('registration_attempt', {
        username: formData.username,
        passwordStrength: passwordStrengthInfo?.level || 'unknown'
      });
      
      const result = await register(formData.username, formData.password);
      
      if (result.success) {
        securityLogger.log('registration_success', {
          username: formData.username
        });
        onSuccess && onSuccess(result.user);
      }
    } catch (error) {
      console.error('Registration error:', error);
      securityLogger.log('registration_error', {
        username: formData.username,
        error: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="register-form-container">
      <div className="register-form">
        <div className="form-header">
          <h2>Create Account</h2>
          <p>Join Shiksha and start your learning journey!</p>
        </div>
        
        {error && (
          <div className="error-message">
            <span>{error}</span>
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
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isSubmitting}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
            {passwordStrengthInfo && formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill strength-${passwordStrengthInfo.score}`}
                    style={{ width: `${(passwordStrengthInfo.score / 4) * 100}%` }}
                  />
                </div>
                <div className="strength-details">
                  <span className={`strength-text strength-${passwordStrengthInfo.score}`}>
                    {passwordStrengthInfo.level}
                  </span>
                  {passwordStrengthInfo.suggestions.length > 0 && (
                    <div className="strength-suggestions">
                      <FaExclamationTriangle className="suggestion-icon" />
                      <span>{passwordStrengthInfo.suggestions[0]}</span>
                    </div>
                  )}
                  {passwordStrengthInfo.score >= 3 && (
                    <div className="strength-good">
                      <FaCheckCircle className="check-icon" />
                      <span>Strong password!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={validationErrors.confirmPassword ? 'error' : ''}
                disabled={loading || isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading || isSubmitting}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) ? (
              <>
                <FaSpinner className="spinner" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              className="link-btn"
              onClick={onSwitchToLogin}
              disabled={loading || isSubmitting}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;