import React, { createContext, useContext, useState, useEffect } from 'react';
import { hashPassword, verifyPassword } from '../utils/auth';
import { 
  rateLimiter, 
  sanitizeInput, 
  sessionSecurity, 
  securityLogger,
  csrfProtection
} from '../utils/security';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionRefreshTimer, setSessionRefreshTimer] = useState(null);

  // Initialize context
  useEffect(() => {
    // Set up initial security measures
    securityLogger.log('auth_context_initialized', {
      timestamp: Date.now()
    });
    
    // Generate initial CSRF token
    if (!csrfProtection.getToken()) {
      csrfProtection.generateToken();
      securityLogger.log('csrf_token_generated', {
        timestamp: Date.now()
      });
    }
  }, []);

  // Check for existing session on app load
  useEffect(() => {
    const validateSession = async () => {
      try {
        const storedUser = localStorage.getItem('eduquest_user');
        const storedSession = localStorage.getItem('eduquest_session');
        
        if (storedUser && storedSession) {
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Verify JWT token
          const tokenPayload = sessionSecurity.verifyToken(session.token);
          if (!tokenPayload) {
            securityLogger.log('session_invalid_token', {
              username: user.username,
              reason: 'invalid_or_expired_token'
            });
            throw new Error('Invalid or expired session token');
          }
          
          // Verify token payload matches session data
          if (tokenPayload.userId !== session.userId) {
            securityLogger.log('session_mismatch_detected', {
              tokenUserId: tokenPayload.userId,
              sessionUserId: session.userId,
              username: user.username
            });
            throw new Error('Session data mismatch');
          }
          
          // Check if token should be refreshed (2 hours before expiration)
          const timeUntilExpiry = tokenPayload.exp - Date.now();
          const refreshThreshold = 2 * 60 * 60 * 1000; // 2 hours
          
          if (timeUntilExpiry > 0 && timeUntilExpiry < refreshThreshold) {
            await refreshSession();
          }
          
          // Restore user session with token payload data
          setCurrentUser({
            ...user,
            role: tokenPayload.role || 'student',
            permissions: tokenPayload.permissions || ['read']
          });
          
          securityLogger.log('session_validated', {
            username: user.username,
            tokenId: tokenPayload.jti,
            refreshCount: tokenPayload.refreshCount || 0,
            sessionAge: Math.round((Date.now() - session.timestamp) / 1000 / 60) // minutes
          });
        }
      } catch (error) {
        console.error('Session validation error:', error);
        
        securityLogger.log('session_validation_error', {
          error: error.message
        });
        
        // Clear potentially corrupted or expired data
        localStorage.removeItem('eduquest_user');
        localStorage.removeItem('eduquest_session');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // Session refresh functionality
  const refreshSession = async () => {
    try {
      const sessionData = JSON.parse(localStorage.getItem('eduquest_session') || '{}');
      const userData = JSON.parse(localStorage.getItem('eduquest_user') || '{}');
      
      if (!sessionData.token || !userData.username) {
        return false;
      }

      // Verify current token
      const tokenPayload = sessionSecurity.verifyToken(sessionData.token);
      if (!tokenPayload) {
        throw new Error('Invalid token for refresh');
      }

      // Check if session needs refresh based on session type
       const timeUntilExpiry = sessionData.expiresAt - Date.now();
       const isPersistent = sessionData.rememberMe || sessionData.persistent;
       const refreshThreshold = isPersistent ? (24 * 60 * 60 * 1000) : (5 * 60 * 1000); // 24 hours for persistent, 5 minutes for regular
       const shouldRefresh = timeUntilExpiry < refreshThreshold;
       
       if (shouldRefresh && timeUntilExpiry > 0) {
         // Refresh JWT token with updated payload
         const sessionDuration = isPersistent ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
         const newToken = sessionSecurity.refreshToken(sessionData.token, sessionDuration);
         
         if (!newToken) {
           throw new Error('Failed to refresh JWT token');
         }
         
         const newExpiresAt = Date.now() + sessionDuration;
        
        const refreshedSession = {
           ...sessionData,
           token: newToken,
           expiresAt: newExpiresAt,
           refreshedAt: Date.now(),
           refreshCount: (sessionData.refreshCount || 0) + 1
         };
        
        localStorage.setItem('eduquest_session', JSON.stringify(refreshedSession));
        
        // Verify new token
        const newTokenPayload = sessionSecurity.verifyToken(newToken);
        
        securityLogger.log('session_refreshed', {
           username: userData.username,
           oldTokenId: tokenPayload.jti,
           newTokenId: newTokenPayload?.jti,
           sessionType: isPersistent ? 'persistent' : 'regular',
           refreshCount: refreshedSession.refreshCount
         });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      securityLogger.log('session_refresh_error', {
        error: error.message
      });
      
      // Clear session on refresh failure
      localStorage.removeItem('eduquest_user');
      localStorage.removeItem('eduquest_session');
      setCurrentUser(null);
      setError('Session refresh failed. Please log in again.');
      
      return false;
    }
  };

  // Setup automatic session refresh timer
  const setupSessionRefreshTimer = () => {
    // Clear existing timer
    if (sessionRefreshTimer) {
      clearInterval(sessionRefreshTimer);
    }
    
    // Set up new timer to check every 2 minutes
    const timer = setInterval(async () => {
      if (currentUser) {
        const refreshed = await refreshSession();
        if (!refreshed) {
          // Check if session is still valid
          const sessionData = JSON.parse(localStorage.getItem('eduquest_session') || '{}');
          if (sessionData.expiresAt && sessionData.expiresAt <= Date.now()) {
            // Session expired, logout user
            logout();
          }
        }
      }
    }, 2 * 60 * 1000); // 2 minutes
    
    setSessionRefreshTimer(timer);
  };

  // Start session refresh timer when user logs in
  useEffect(() => {
    if (currentUser) {
      setupSessionRefreshTimer();
    } else {
      // Clear timer when user logs out
      if (sessionRefreshTimer) {
        clearInterval(sessionRefreshTimer);
        setSessionRefreshTimer(null);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (sessionRefreshTimer) {
        clearInterval(sessionRefreshTimer);
      }
    };
  }, [currentUser]);

  const register = async (username, password) => {
    setError('');
    setLoading(true);

    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('eduquest_users') || '[]');
      const userExists = existingUsers.find(user => user.username === username);
      
      if (userExists) {
        throw new Error('Username already exists');
      }

      // Validate input
      if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        // Default user data for EduQuest
        name: username,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        weeklyProgress: 0,
        weeklyGoal: 5,
        completedCourses: [],
        currentCourses: [],
        badges: []
      };

      // Save to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('eduquest_users', JSON.stringify(existingUsers));
      
      // Create session
      const sessionData = {
        userId: newUser.id,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('eduquest_session', JSON.stringify(sessionData));
      localStorage.setItem('eduquest_user', JSON.stringify(newUser));
      
      setCurrentUser(newUser);
      return { success: true, user: newUser };
      
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, rememberMe = false, csrfToken = null) => {
    setError('');
    setLoading(true);

    try {
      // Validate CSRF token
      if (!csrfToken || !csrfProtection.validateToken(csrfToken)) {
        securityLogger.log('login_csrf_validation_failed', {
          username: sanitizeInput.username(username),
          hasToken: !!csrfToken,
          timestamp: Date.now()
        });
        throw new Error('Invalid security token. Please refresh the page and try again.');
      }

      // Sanitize inputs
      const sanitizedUsername = sanitizeInput.username(username);
      const sanitizedPassword = sanitizeInput.password(password);
      
      // Check rate limiting
      const rateLimitCheck = rateLimiter.checkRateLimit(sanitizedUsername);
      if (!rateLimitCheck.allowed) {
        const errorMessage = rateLimitCheck.reason === 'account_locked' 
          ? `Account temporarily locked. Try again in ${rateLimitCheck.remainingTime} minutes.`
          : `Too many login attempts. Account locked for ${rateLimitCheck.remainingTime} minutes.`;
        
        securityLogger.log('login_rate_limited', {
          username: sanitizedUsername,
          reason: rateLimitCheck.reason,
          remainingTime: rateLimitCheck.remainingTime
        });
        
        throw new Error(errorMessage);
      }
      
      // Validate input format
      if (!sanitizedUsername || sanitizedUsername.length < 3) {
        throw new Error('Please enter a valid username');
      }
      
      if (!sanitizedPassword || sanitizedPassword.length < 6) {
        throw new Error('Please enter a valid password');
      }

      // Get users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('eduquest_users') || '[]');
      const user = existingUsers.find(u => u.username === sanitizedUsername);
      
      if (!user) {
        // Record failed attempt
        rateLimiter.recordFailedAttempt(sanitizedUsername);
        
        securityLogger.log('login_failed', {
          username: sanitizedUsername,
          reason: 'user_not_found',
          attemptsRemaining: rateLimitCheck.attemptsRemaining - 1
        });
        
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isValidPassword = await verifyPassword(sanitizedPassword, user.password);
      
      if (!isValidPassword) {
        // Record failed attempt
        rateLimiter.recordFailedAttempt(sanitizedUsername);
        
        securityLogger.log('login_failed', {
          username: sanitizedUsername,
          reason: 'invalid_password',
          attemptsRemaining: rateLimitCheck.attemptsRemaining - 1
        });
        
        throw new Error('Invalid username or password');
      }
      
      // Clear failed attempts on successful login
      rateLimiter.clearAttempts(sanitizedUsername);

      // Create JWT-like token with user payload
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role || 'student',
        permissions: user.permissions || ['read'],
        rememberMe,
        csrfToken: csrfProtection.getToken()
      };

      const expirationTime = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 24 hours
      const sessionToken = sessionSecurity.generateToken(tokenPayload, expirationTime);

      // Create secure session
      const sessionData = {
        token: sessionToken,
        userId: user.id,
        timestamp: new Date().getTime(),
        expiresAt: Date.now() + expirationTime,
        rememberMe: rememberMe,
        persistent: rememberMe,
        tokenPayload,
        csrfToken: csrfProtection.getToken()
      };
      
      localStorage.setItem('eduquest_session', JSON.stringify(sessionData));
      localStorage.setItem('eduquest_user', JSON.stringify(user));
      
      // Generate new CSRF token for the session
      csrfProtection.generateToken();
      
      securityLogger.log('login_success', {
        username: sanitizedUsername,
        sessionToken: sessionToken.substring(0, 8) + '...', // Log partial token for debugging
        loginTime: new Date().toISOString(),
        rememberMe: rememberMe,
        sessionDuration: rememberMe ? '30 days' : '24 hours',
        tokenId: tokenPayload.jti,
        userAgent: navigator.userAgent?.substring(0, 100) || 'unknown',
        csrfTokenPresent: true
      });
      
      setCurrentUser({
        ...user,
        role: user.role || 'student',
        permissions: user.permissions || ['read']
      });
      return { success: true, user };
      
    } catch (error) {
      securityLogger.log('login_error', {
        username: sanitizeInput.username(username),
        error: error.message
      });
      
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Get current session info for logging
    const storedToken = localStorage.getItem('eduquest_session');
    let logData = { timestamp: Date.now() };
    
    if (storedToken && currentUser) {
      try {
        const sessionData = JSON.parse(storedToken);
        if (sessionData.token) {
          const tokenPayload = sessionSecurity.verifyToken(sessionData.token);
          if (tokenPayload) {
            logData = {
              ...logData,
              userId: tokenPayload.userId,
              username: tokenPayload.username,
              tokenId: tokenPayload.jti,
              sessionDuration: Math.round((Date.now() - (tokenPayload.iat || sessionData.timestamp)) / 1000 / 60) // minutes
            };
          }
        }
      } catch (error) {
        console.error('Error parsing session data during logout:', error);
      }
    }
    
    // Clear session refresh timer
    if (sessionRefreshTimer) {
      clearInterval(sessionRefreshTimer);
      setSessionRefreshTimer(null);
    }
    
    // Clear all session data
    localStorage.removeItem('eduquest_user');
    localStorage.removeItem('eduquest_session');
    localStorage.removeItem('userSession');
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem('userSession');
    sessionStorage.removeItem('sessionToken');
    
    setCurrentUser(null);
    setError('');
    
    // Log security event
    securityLogger.log('user_logout', logData);
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};