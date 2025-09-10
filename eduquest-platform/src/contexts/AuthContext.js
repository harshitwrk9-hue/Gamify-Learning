import React, { createContext, useContext, useState, useEffect } from 'react';
import { hashPassword, verifyPassword } from '../utils/auth';
import { rateLimiter, sanitizeInput, sessionSecurity, securityLogger } from '../utils/security';

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

  // Check for existing session on app load
  useEffect(() => {
    const validateSession = () => {
      try {
        const storedUser = localStorage.getItem('eduquest_user');
        const storedSession = localStorage.getItem('eduquest_session');
        
        if (storedUser && storedSession) {
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Validate session token format
          if (!sessionSecurity.isValidTokenFormat(session.token)) {
            securityLogger.log('session_invalid_token', {
              username: user.username,
              reason: 'invalid_token_format'
            });
            throw new Error('Invalid session token format');
          }
          
          // Check if session is still valid
          if (sessionSecurity.isSessionValid(session.timestamp)) {
            // Check if session should be refreshed
            if (sessionSecurity.shouldRefreshSession(session.timestamp)) {
              // Refresh session with new token and timestamp
              const newSessionData = {
                ...session,
                token: sessionSecurity.generateSecureToken(),
                timestamp: Date.now()
              };
              
              localStorage.setItem('eduquest_session', JSON.stringify(newSessionData));
              
              securityLogger.log('session_refreshed', {
                username: user.username,
                oldToken: session.token.substring(0, 8) + '...',
                newToken: newSessionData.token.substring(0, 8) + '...'
              });
            }
            
            setCurrentUser(user);
            
            securityLogger.log('session_validated', {
              username: user.username,
              sessionAge: Math.round((Date.now() - session.timestamp) / 1000 / 60) // minutes
            });
          } else {
            // Session expired
            securityLogger.log('session_expired', {
              username: user.username,
              sessionAge: Math.round((Date.now() - session.timestamp) / 1000 / 60) // minutes
            });
            throw new Error('Session expired');
          }
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

      // Check if session needs refresh based on session type
       const timeUntilExpiry = sessionData.expiresAt - Date.now();
       const isPersistent = sessionData.rememberMe || sessionData.persistent;
       const refreshThreshold = isPersistent ? (24 * 60 * 60 * 1000) : (5 * 60 * 1000); // 24 hours for persistent, 5 minutes for regular
       const shouldRefresh = timeUntilExpiry < refreshThreshold;
       
       if (shouldRefresh && timeUntilExpiry > 0) {
         // Generate new session token with appropriate duration
         const newToken = sessionSecurity.generateToken();
         const sessionDuration = isPersistent ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
         const newExpiresAt = Date.now() + sessionDuration;
        
        const refreshedSession = {
           ...sessionData,
           token: newToken,
           expiresAt: newExpiresAt,
           refreshedAt: Date.now(),
           refreshCount: (sessionData.refreshCount || 0) + 1
         };
        
        localStorage.setItem('eduquest_session', JSON.stringify(refreshedSession));
        
        securityLogger.log('session_refreshed', {
           username: userData.username,
           oldToken: sessionData.token.substring(0, 8) + '...',
           newToken: newToken.substring(0, 8) + '...',
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

  const login = async (username, password, rememberMe = false) => {
    setError('');
    setLoading(true);

    try {
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

      // Create secure session
      const sessionDuration = rememberMe ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000); // 30 days or 24 hours
      const sessionToken = sessionSecurity.generateSecureToken();
      const sessionData = {
        token: sessionToken,
        userId: user.id,
        timestamp: new Date().getTime(),
        expiresAt: Date.now() + sessionDuration,
        rememberMe: rememberMe,
        persistent: rememberMe
      };
      
      localStorage.setItem('eduquest_session', JSON.stringify(sessionData));
      localStorage.setItem('eduquest_user', JSON.stringify(user));
      
      securityLogger.log('login_success', {
        username: sanitizedUsername,
        sessionToken: sessionToken.substring(0, 8) + '...', // Log partial token for debugging
        loginTime: new Date().toISOString(),
        rememberMe: rememberMe,
        sessionDuration: rememberMe ? '30 days' : '24 hours'
      });
      
      setCurrentUser(user);
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
    const user = currentUser;
    
    // Log logout event
    if (user) {
      securityLogger.log('logout', {
        username: user.username,
        sessionDuration: (() => {
          try {
            const session = JSON.parse(localStorage.getItem('eduquest_session') || '{}');
            return session.timestamp ? Math.round((Date.now() - session.timestamp) / 1000 / 60) : 0;
          } catch {
            return 0;
          }
        })()
      });
    }
    
    // Clear session refresh timer
    if (sessionRefreshTimer) {
      clearInterval(sessionRefreshTimer);
      setSessionRefreshTimer(null);
    }
    
    // Clear session data
    localStorage.removeItem('eduquest_user');
    localStorage.removeItem('eduquest_session');
    setCurrentUser(null);
    setError('');
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