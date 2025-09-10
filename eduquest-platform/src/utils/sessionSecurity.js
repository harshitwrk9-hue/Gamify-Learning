/**
 * Session Security Utilities
 * Provides secure session management with comprehensive logging
 */

import securityLogger from './securityLogger.js';

class SessionSecurity {
  constructor() {
    this.tokenLength = 64;
    this.maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    this.sessionCleanupInterval = 60 * 60 * 1000; // 1 hour
    this.activeSessions = new Map();
    this.suspiciousSessions = new Set();
    
    this.initializeSessionMonitoring();
  }

  initializeSessionMonitoring() {
    // Periodic cleanup of expired sessions
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.sessionCleanupInterval);

    // Monitor for session anomalies
    setInterval(() => {
      this.monitorSessionAnomalies();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  generateSecureToken() {
    try {
      // Use crypto API for secure random token generation
      const array = new Uint8Array(this.tokenLength / 2);
      
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
      } else {
        // Fallback for environments without crypto API
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
      
      const token = Array.from(array, byte => 
        byte.toString(16).padStart(2, '0')
      ).join('');
      
      securityLogger.log('token_generated', {
        tokenLength: token.length,
        method: typeof window !== 'undefined' && window.crypto ? 'crypto' : 'fallback'
      });
      
      return token;
    } catch (error) {
      securityLogger.logError(error, { context: 'token_generation' });
      throw new Error('Failed to generate secure token');
    }
  }

  // Legacy method for backward compatibility
  generateToken() {
    return this.generateSecureToken();
  }

  validateSession(sessionData) {
    try {
      if (!sessionData || typeof sessionData !== 'object') {
        securityLogger.log('session_validation_failed', {
          reason: 'invalid_session_data',
          dataType: typeof sessionData
        }, 'warn');
        return false;
      }

      const { token, expiresAt, userId, timestamp } = sessionData;

      // Check required fields
      if (!token || !expiresAt || !userId) {
        securityLogger.log('session_validation_failed', {
          reason: 'missing_required_fields',
          hasToken: !!token,
          hasExpiresAt: !!expiresAt,
          hasUserId: !!userId
        }, 'warn');
        return false;
      }

      // Check token format
      if (!this.isValidTokenFormat(token)) {
        securityLogger.log('session_validation_failed', {
          reason: 'invalid_token_format',
          tokenLength: token.length
        }, 'warn');
        return false;
      }

      // Check expiration
      const now = Date.now();
      if (now > expiresAt) {
        securityLogger.log('session_expired', {
          userId,
          expiredAt: new Date(expiresAt).toISOString(),
          expiredBy: Math.round((now - expiresAt) / 1000) + ' seconds'
        });
        return false;
      }

      // Check for suspicious session activity
      if (this.isSuspiciousSession(sessionData)) {
        securityLogger.log('suspicious_session_detected', {
          userId,
          sessionId: token.substring(0, 8) + '...'
        }, 'warn');
        return false;
      }

      // Track active session
      this.trackActiveSession(sessionData);

      securityLogger.log('session_validated', {
        userId,
        sessionAge: Math.round((now - (timestamp || now)) / 1000) + ' seconds',
        timeUntilExpiry: Math.round((expiresAt - now) / 1000) + ' seconds'
      });

      return true;
    } catch (error) {
      securityLogger.logError(error, { 
        context: 'session_validation',
        sessionData: this.sanitizeSessionData(sessionData)
      });
      return false;
    }
  }

  isValidTokenFormat(token) {
    if (typeof token !== 'string') return false;
    if (token.length !== this.tokenLength) return false;
    
    // Check if token contains only hexadecimal characters
    const hexPattern = /^[a-f0-9]+$/i;
    return hexPattern.test(token);
  }

  isSuspiciousSession(sessionData) {
    const sessionId = sessionData.token;
    
    // Check if session is already marked as suspicious
    if (this.suspiciousSessions.has(sessionId)) {
      return true;
    }

    // Check for rapid session creation from same user
    const recentSessions = Array.from(this.activeSessions.values())
      .filter(session => 
        session.userId === sessionData.userId &&
        Date.now() - session.createdAt < 5 * 60 * 1000 // 5 minutes
      );

    if (recentSessions.length > 5) {
      this.markSessionSuspicious(sessionId, 'rapid_session_creation');
      return true;
    }

    // Check for unusual session duration patterns
    if (this.hasUnusualDurationPattern(sessionData)) {
      this.markSessionSuspicious(sessionId, 'unusual_duration_pattern');
      return true;
    }

    return false;
  }

  hasUnusualDurationPattern(sessionData) {
    const { expiresAt, timestamp, rememberMe } = sessionData;
    const sessionDuration = expiresAt - (timestamp || Date.now());
    
    // Check for suspiciously long sessions without remember me
    if (!rememberMe && sessionDuration > 7 * 24 * 60 * 60 * 1000) { // 7 days
      return true;
    }

    // Check for suspiciously short sessions
    if (sessionDuration < 5 * 60 * 1000) { // 5 minutes
      return true;
    }

    return false;
  }

  markSessionSuspicious(sessionId, reason) {
    this.suspiciousSessions.add(sessionId);
    securityLogger.log('session_marked_suspicious', {
      sessionId: sessionId.substring(0, 8) + '...',
      reason
    }, 'warn');
  }

  trackActiveSession(sessionData) {
    const sessionInfo = {
      userId: sessionData.userId,
      createdAt: sessionData.timestamp || Date.now(),
      lastActivity: Date.now(),
      expiresAt: sessionData.expiresAt,
      rememberMe: sessionData.rememberMe || false,
      refreshCount: sessionData.refreshCount || 0
    };

    this.activeSessions.set(sessionData.token, sessionInfo);
  }

  updateSessionActivity(token) {
    const session = this.activeSessions.get(token);
    if (session) {
      session.lastActivity = Date.now();
      this.activeSessions.set(token, session);
    }
  }

  revokeSession(token, reason = 'manual_revocation') {
    try {
      const session = this.activeSessions.get(token);
      if (session) {
        this.activeSessions.delete(token);
        this.suspiciousSessions.delete(token);
        
        securityLogger.log('session_revoked', {
          userId: session.userId,
          sessionId: token.substring(0, 8) + '...',
          reason,
          sessionAge: Math.round((Date.now() - session.createdAt) / 1000) + ' seconds'
        });
        
        return true;
      }
      return false;
    } catch (error) {
      securityLogger.logError(error, { 
        context: 'session_revocation',
        token: token.substring(0, 8) + '...',
        reason
      });
      return false;
    }
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [token, session] of this.activeSessions.entries()) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(token);
        this.suspiciousSessions.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      securityLogger.log('session_cleanup', {
        cleanedSessions: cleanedCount,
        remainingSessions: this.activeSessions.size
      });
    }
  }

  monitorSessionAnomalies() {
    const now = Date.now();
    const anomalies = [];

    // Check for sessions with no recent activity
    const inactiveSessions = Array.from(this.activeSessions.entries())
      .filter(([token, session]) => {
        const inactiveTime = now - session.lastActivity;
        return inactiveTime > 2 * 60 * 60 * 1000; // 2 hours
      });

    if (inactiveSessions.length > 0) {
      anomalies.push({
        type: 'inactive_sessions',
        count: inactiveSessions.length,
        sessions: inactiveSessions.map(([token, session]) => ({
          sessionId: token.substring(0, 8) + '...',
          userId: session.userId,
          inactiveTime: Math.round((now - session.lastActivity) / 1000 / 60) + ' minutes'
        }))
      });
    }

    // Check for users with multiple active sessions
    const userSessions = new Map();
    for (const [token, session] of this.activeSessions.entries()) {
      if (!userSessions.has(session.userId)) {
        userSessions.set(session.userId, []);
      }
      userSessions.get(session.userId).push({ token, ...session });
    }

    const multiSessionUsers = Array.from(userSessions.entries())
      .filter(([userId, sessions]) => sessions.length > 3)
      .map(([userId, sessions]) => ({
        userId,
        sessionCount: sessions.length
      }));

    if (multiSessionUsers.length > 0) {
      anomalies.push({
        type: 'multiple_sessions_per_user',
        users: multiSessionUsers
      });
    }

    // Log anomalies
    anomalies.forEach(anomaly => {
      securityLogger.log('session_anomaly_detected', anomaly, 'warn');
    });
  }

  sanitizeSessionData(sessionData) {
    if (!sessionData || typeof sessionData !== 'object') {
      return sessionData;
    }

    const sanitized = { ...sessionData };
    
    // Sanitize sensitive fields
    if (sanitized.token) {
      sanitized.token = sanitized.token.substring(0, 8) + '...';
    }
    
    return sanitized;
  }

  // Security reporting methods
  getSessionStats() {
    const now = Date.now();
    const stats = {
      totalActiveSessions: this.activeSessions.size,
      suspiciousSessions: this.suspiciousSessions.size,
      sessionsByType: { regular: 0, persistent: 0 },
      averageSessionAge: 0,
      oldestSession: null,
      newestSession: null
    };

    let totalAge = 0;
    let oldestTime = now;
    let newestTime = 0;

    for (const [token, session] of this.activeSessions.entries()) {
      // Count by type
      if (session.rememberMe) {
        stats.sessionsByType.persistent++;
      } else {
        stats.sessionsByType.regular++;
      }

      // Calculate ages
      const sessionAge = now - session.createdAt;
      totalAge += sessionAge;

      if (session.createdAt < oldestTime) {
        oldestTime = session.createdAt;
        stats.oldestSession = {
          age: Math.round(sessionAge / 1000 / 60) + ' minutes',
          userId: session.userId
        };
      }

      if (session.createdAt > newestTime) {
        newestTime = session.createdAt;
        stats.newestSession = {
          age: Math.round(sessionAge / 1000 / 60) + ' minutes',
          userId: session.userId
        };
      }
    }

    if (this.activeSessions.size > 0) {
      stats.averageSessionAge = Math.round(totalAge / this.activeSessions.size / 1000 / 60) + ' minutes';
    }

    return stats;
  }

  getSecurityReport() {
    return {
      sessionStats: this.getSessionStats(),
      securitySummary: securityLogger.getSecuritySummary(),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const sessionSecurity = new SessionSecurity();

export default sessionSecurity;