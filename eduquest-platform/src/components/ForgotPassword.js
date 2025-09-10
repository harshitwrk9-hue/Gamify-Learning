import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { sanitizeInput, securityLogger } from '../utils/security';
import './ForgotPassword.css';

const ForgotPassword = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setValidationError('');
    setError('');
    
    if (value && !validateEmail(value)) {
      setValidationError('Please enter a valid email address');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Sanitize email input
      const sanitizedEmail = sanitizeInput.text(email.trim().toLowerCase());
      
      // Log password reset attempt
      securityLogger.log('password_reset_requested', {
        email: sanitizedEmail,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would send a reset email
      // For demo purposes, we'll just show success
      setSuccess(true);
      
      securityLogger.log('password_reset_email_sent', {
        email: sanitizedEmail,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please try again.');
      
      securityLogger.log('password_reset_error', {
        email: sanitizeInput.text(email),
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setValidationError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="forgot-password-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="forgot-password-modal"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <button 
              className="close-btn"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className="modal-content">
            {!success ? (
              <>
                <div className="modal-title">
                  <h2>Reset Password</h2>
                  <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {error && (
                  <motion.div 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FaExclamationTriangle className="error-icon" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="forgot-password-form">
                  <div className="form-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <div className="input-wrapper">
                      <FaEnvelope className="input-icon" />
                      <input
                        type="email"
                        id="reset-email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        className={validationError ? 'error' : ''}
                        disabled={loading}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    {validationError && (
                      <span className="field-error">{validationError}</span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={loading || validationError || !email.trim()}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="spinner" />
                          Sending Reset Link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      className="back-btn"
                      onClick={handleBackToLogin}
                      disabled={loading}
                    >
                      <FaArrowLeft />
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <motion.div 
                className="success-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="success-icon">
                  <FaCheckCircle />
                </div>
                <h2>Reset Link Sent!</h2>
                <p>
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your email and follow the instructions to reset your password.
                </p>
                <div className="success-note">
                  <p>Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
                </div>
                <button 
                  className="back-btn primary"
                  onClick={handleBackToLogin}
                >
                  <FaArrowLeft />
                  Back to Sign In
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPassword;