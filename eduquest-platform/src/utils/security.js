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
 * Session security utilities with JWT-like functionality
 */
export const sessionSecurity = {
  // Secret key for token signing (in production, this should be server-side)
  SECRET_KEY: 'eduquest_secret_2024_secure_key_change_in_production',

  /**
   * Generate a secure session token with payload
   * @param {object} payload - Token payload (user info, permissions, etc.)
   * @param {number} expiresIn - Token expiration time in milliseconds
   * @returns {string} JWT-like token
   */
  generateToken: (payload = {}, expiresIn = 24 * 60 * 60 * 1000) => {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Date.now();
    const tokenPayload = {
      ...payload,
      iat: now, // issued at
      exp: now + expiresIn, // expires at
      jti: sessionSecurity.generateSecureToken() // unique token ID
    };

    const encodedHeader = sessionSecurity.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = sessionSecurity.base64UrlEncode(JSON.stringify(tokenPayload));
    const signature = sessionSecurity.sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  /**
   * Verify and decode a JWT-like token
   * @param {string} token - Token to verify
   * @returns {object|null} Decoded payload or null if invalid
   */
  verifyToken: (token) => {
    try {
      if (typeof token !== 'string') return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      
      // Verify signature
      const expectedSignature = sessionSecurity.sign(`${encodedHeader}.${encodedPayload}`);
      if (signature !== expectedSignature) {
        securityLogger.log('token_signature_invalid', { token: token.substring(0, 20) + '...' });
        return null;
      }

      // Decode payload
      const payload = JSON.parse(sessionSecurity.base64UrlDecode(encodedPayload));
      
      // Check expiration
      if (payload.exp && Date.now() > payload.exp) {
        securityLogger.log('token_expired', { 
          userId: payload.userId,
          expiredAt: new Date(payload.exp).toISOString()
        });
        return null;
      }

      return payload;
    } catch (error) {
      securityLogger.log('token_verification_error', { error: error.message });
      return null;
    }
  },

  /**
   * Generate a secure random token
   * @returns {string} Secure random token
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
   * Base64 URL encode
   * @param {string} str - String to encode
   * @returns {string} Base64 URL encoded string
   */
  base64UrlEncode: (str) => {
    return btoa(str)
      .replace(/[+/=]/g, (match) => {
        const replacements = { '+': '-', '/': '_', '=': '' };
        return replacements[match];
      });
  },

  /**
   * Base64 URL decode
   * @param {string} str - String to decode
   * @returns {string} Decoded string
   */
  base64UrlDecode: (str) => {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(str);
  },

  /**
   * Sign data using HMAC-like algorithm
   * @param {string} data - Data to sign
   * @returns {string} Signature
   */
  sign: (data) => {
    // Simple HMAC-like signing (in production, use proper HMAC)
    const key = sessionSecurity.SECRET_KEY;
    let hash = 0;
    const combined = key + data + key;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return sessionSecurity.base64UrlEncode(Math.abs(hash).toString(36));
  },

  /**
   * Validate session token format
   * @param {string} token - Session token to validate
   * @returns {boolean} True if token format is valid
   */
  isValidTokenFormat: (token) => {
    if (typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
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
  },

  /**
   * Refresh an existing token with new expiration
   * @param {string} token - Current token
   * @param {number} expiresIn - New expiration time in milliseconds
   * @returns {string|null} New token or null if current token is invalid
   */
  refreshToken: (token, expiresIn = 24 * 60 * 60 * 1000) => {
    const payload = sessionSecurity.verifyToken(token);
    if (!payload) return null;

    // Create new token with updated expiration but same payload data
    const newPayload = {
      ...payload,
      iat: Date.now(),
      exp: Date.now() + expiresIn,
      jti: sessionSecurity.generateSecureToken(), // new unique ID
      refreshCount: (payload.refreshCount || 0) + 1
    };

    delete newPayload.exp; // Remove old expiration
    return sessionSecurity.generateToken(newPayload, expiresIn);
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
 * CSRF Protection utilities
 */
export const csrfProtection = {
  /**
   * Generate CSRF token
   * @returns {string} CSRF token
   */
  generateToken: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = btoa(String.fromCharCode.apply(null, array))
      .replace(/[+/=]/g, (match) => {
        const replacements = { '+': '-', '/': '_', '=': '' };
        return replacements[match];
      });
    
    // Store in session storage for SPA
    sessionStorage.setItem('csrf_token', token);
    return token;
  },

  /**
   * Validate CSRF token
   * @param {string} token - Token to validate
   * @returns {boolean} True if valid
   */
  validateToken: (token) => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken && storedToken === token;
  },

  /**
   * Get current CSRF token
   * @returns {string|null} Current token or null
   */
  getToken: () => {
    return sessionStorage.getItem('csrf_token');
  },

  /**
   * Clear CSRF token
   */
  clearToken: () => {
    sessionStorage.removeItem('csrf_token');
  }
};

/**
 * Content Security Policy utilities
 */
export const contentSecurity = {
  /**
   * Sanitize HTML content to prevent XSS
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
  sanitizeHtml: (html) => {
    if (!html) return '';
    
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  },

  /**
   * Validate and sanitize URL to prevent open redirects
   * @param {string} url - URL to validate
   * @param {array} allowedDomains - List of allowed domains
   * @returns {string|null} Sanitized URL or null if invalid
   */
  sanitizeUrl: (url, allowedDomains = []) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url, window.location.origin);
      
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }
      
      // Check if domain is allowed (if allowedDomains specified)
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );
        if (!isAllowed) return null;
      }
      
      return urlObj.toString();
    } catch {
      return null;
    }
  },

  /**
   * Generate Content Security Policy nonce
   * @returns {string} CSP nonce
   */
  generateNonce: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  }
};

/**
 * Security headers utilities
 */
export const securityHeaders = {
  /**
   * Get recommended security headers for API requests
   * @returns {object} Security headers
   */
  getApiHeaders: () => {
    const csrfToken = csrfProtection.getToken();
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': csrfToken || '',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };
  },

  /**
   * Validate response headers for security
   * @param {Headers} headers - Response headers
   * @returns {object} Validation result
   */
  validateResponseHeaders: (headers) => {
    const issues = [];
    const recommendations = [];
    
    // Check for security headers
    if (!headers.get('X-Content-Type-Options')) {
      issues.push('Missing X-Content-Type-Options header');
    }
    
    if (!headers.get('X-Frame-Options') && !headers.get('Content-Security-Policy')) {
      issues.push('Missing clickjacking protection');
    }
    
    if (!headers.get('Strict-Transport-Security')) {
      recommendations.push('Consider adding HSTS header');
    }
    
    return { issues, recommendations };
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