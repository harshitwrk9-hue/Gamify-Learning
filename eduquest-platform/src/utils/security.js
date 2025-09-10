// Security utilities for authentication and user protection

/**
 * Rate limiting utility to prevent brute force attacks
 */
class RateLimiter {
  constructor() {
    this.attempts = new Map();
    this.lockouts = new Map();
  }

  /**
   * Check if an IP/user is rate limited
   * @param {string} identifier - IP address or username
   * @param {number} maxAttempts - Maximum attempts allowed (default: 5)
   * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
   * @returns {object} Rate limit status
   */
  checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the time window
    const recentAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    
    // Check if user is currently locked out
    const lockoutEnd = this.lockouts.get(identifier);
    if (lockoutEnd && now < lockoutEnd) {
      const remainingTime = Math.ceil((lockoutEnd - now) / 1000 / 60); // minutes
      return {
        allowed: false,
        reason: 'account_locked',
        remainingTime,
        attemptsRemaining: 0
      };
    }

    // Check rate limit
    if (recentAttempts.length >= maxAttempts) {
      // Lock account for 30 minutes
      this.lockouts.set(identifier, now + (30 * 60 * 1000));
      return {
        allowed: false,
        reason: 'rate_limited',
        remainingTime: 30,
        attemptsRemaining: 0
      };
    }

    return {
      allowed: true,
      attemptsRemaining: maxAttempts - recentAttempts.length
    };
  }

  /**
   * Record a failed login attempt
   * @param {string} identifier - IP address or username
   */
  recordFailedAttempt(identifier) {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    userAttempts.push(now);
    this.attempts.set(identifier, userAttempts);
  }

  /**
   * Clear failed attempts for successful login
   * @param {string} identifier - IP address or username
   */
  clearAttempts(identifier) {
    this.attempts.delete(identifier);
    this.lockouts.delete(identifier);
  }

  /**
   * Get remaining lockout time
   * @param {string} identifier - IP address or username
   * @returns {number} Remaining lockout time in minutes
   */
  getRemainingLockoutTime(identifier) {
    const lockoutEnd = this.lockouts.get(identifier);
    if (!lockoutEnd) return 0;
    
    const now = Date.now();
    if (now >= lockoutEnd) {
      this.lockouts.delete(identifier);
      return 0;
    }
    
    return Math.ceil((lockoutEnd - now) / 1000 / 60);
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Input sanitization utilities
 */
export const sanitizeInput = {
  /**
   * Sanitize username input
   * @param {string} username - Raw username input
   * @returns {string} Sanitized username
   */
  username: (username) => {
    if (typeof username !== 'string') return '';
    return username
      .trim()
      .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
      .substring(0, 50); // Limit length
  },

  /**
   * Sanitize password input (minimal sanitization to preserve special chars)
   * @param {string} password - Raw password input
   * @returns {string} Sanitized password
   */
  password: (password) => {
    if (typeof password !== 'string') return '';
    return password.substring(0, 128); // Just limit length
  },

  /**
   * Sanitize general text input
   * @param {string} text - Raw text input
   * @returns {string} Sanitized text
   */
  text: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .trim()
      .replace(/[<>"'&]/g, (match) => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[match];
      })
      .substring(0, 1000);
  }
};

/**
 * Session security utilities
 */
export const sessionSecurity = {
  /**
   * Generate a secure session token
   * @returns {string} Secure session token
   */
  generateSecureToken: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/[+/=]/g, (match) => {
        const replacements = { '+': '-', '/': '_', '=': '' };
        return replacements[match];
      });
  },

  /**
   * Validate session token format
   * @param {string} token - Session token to validate
   * @returns {boolean} True if token format is valid
   */
  isValidTokenFormat: (token) => {
    if (typeof token !== 'string') return false;
    return /^[A-Za-z0-9_-]{40,50}$/.test(token);
  },

  /**
   * Check if session should be refreshed
   * @param {number} timestamp - Session creation timestamp
   * @param {number} maxAge - Maximum session age in milliseconds
   * @param {number} refreshThreshold - Refresh when this much time remains (default: 2 hours)
   * @returns {boolean} True if session should be refreshed
   */
  shouldRefreshSession: (timestamp, maxAge = 24 * 60 * 60 * 1000, refreshThreshold = 2 * 60 * 60 * 1000) => {
    const now = Date.now();
    const sessionAge = now - timestamp;
    const remainingTime = maxAge - sessionAge;
    return remainingTime > 0 && remainingTime < refreshThreshold;
  },

  /**
   * Validate session expiry
   * @param {number} timestamp - Session creation timestamp
   * @param {number} maxAge - Maximum session age in milliseconds (default: 24 hours)
   * @returns {boolean} True if session is still valid
   */
  isSessionValid: (timestamp, maxAge = 24 * 60 * 60 * 1000) => {
    const now = Date.now();
    return (now - timestamp) < maxAge;
  }
};

/**
 * Security logging utilities
 */
export const securityLogger = {
  /**
   * Log security events
   * @param {string} event - Event type
   * @param {object} details - Event details
   */
  log: (event, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In a real application, this would send to a logging service
    console.warn('[SECURITY]', logEntry);
    
    // Store in localStorage for debugging (limit to last 100 entries)
    try {
      const logs = JSON.parse(localStorage.getItem('eduquest_security_logs') || '[]');
      logs.push(logEntry);
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      localStorage.setItem('eduquest_security_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store security log:', error);
    }
  },

  /**
   * Get recent security logs
   * @param {number} limit - Number of logs to retrieve
   * @returns {Array} Recent security logs
   */
  getRecentLogs: (limit = 50) => {
    try {
      const logs = JSON.parse(localStorage.getItem('eduquest_security_logs') || '[]');
      return logs.slice(-limit);
    } catch (error) {
      console.error('Failed to retrieve security logs:', error);
      return [];
    }
  }
};

/**
 * Password strength analyzer
 */
export const passwordStrength = {
  /**
   * Analyze password strength with detailed feedback
   * @param {string} password - Password to analyze
   * @returns {object} Strength analysis
   */
  analyze: (password) => {
    if (!password) {
      return {
        score: 0,
        level: 'very-weak',
        feedback: ['Password is required']
      };
    }

    let score = 0;
    const feedback = [];
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !['password', '123456', 'qwerty', 'admin'].includes(password.toLowerCase())
    };

    // Score calculation
    if (checks.length) score += 2;
    else feedback.push('Use at least 8 characters');
    
    if (checks.lowercase) score += 1;
    else feedback.push('Include lowercase letters');
    
    if (checks.uppercase) score += 1;
    else feedback.push('Include uppercase letters');
    
    if (checks.numbers) score += 1;
    else feedback.push('Include numbers');
    
    if (checks.symbols) score += 2;
    else feedback.push('Include special characters');
    
    if (checks.noCommon) score += 1;
    else feedback.push('Avoid common passwords');

    // Additional length bonus
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Determine level
    let level;
    if (score <= 2) level = 'very-weak';
    else if (score <= 4) level = 'weak';
    else if (score <= 6) level = 'medium';
    else if (score <= 8) level = 'strong';
    else level = 'very-strong';

    return {
      score,
      level,
      feedback: feedback.length > 0 ? feedback : ['Password strength is good']
    };
  }
};