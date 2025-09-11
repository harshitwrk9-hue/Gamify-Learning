/**
 * Session Security Utilities
 * Provides secure session management with comprehensive logging
 */

import securityLogger from './securityLogger.js';

class SessionSecurity {
  constructor() {
    this.tokenLength = 64;
    this.maxSessionAge = 30 * 24 * 60 * 60 * 1000;
    this.sessionCleanupInterval = 60 * 60 * 1000;
    this.activeSessions = new Map();
    this.suspiciousSessions = new Set();
    
    this.initializeSessionMonitoring();
  }

  initializeSessionMonitoring() {

    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.sessionCleanupInterval);


    setInterval(() => {
      this.monitorSessionAnomalies();
    }, 5 * 60 * 1000);
  }

  generateSecureToken() {
    try {
    
      const array = new Uint8Array(this.tokenLength / 2);
      
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
      } else {
    
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

  
      if (!token || !expiresAt || !userId) {
        securityLogger.log('session_validation_failed', {
          reason: 'missing_required_fields',
          hasToken: !!token,
          hasExpiresAt: !!expiresAt,
          hasUserId: !!userId
        }, 'warn');
        return false;
      }

  
      if (!this.isValidTokenFormat(token)) {
        securityLogger.log('session_validation_failed', {
          reason: 'invalid_token_format',
          tokenLength: token.length
        }, 'warn');
        return false;
      }

  
      const now = Date.now();
      if (now > expiresAt) {
        securityLogger.log('session_expired', {
          userId,
          expiredAt: new Date(expiresAt).toISOString(),
          expiredBy: Math.round((now - expiresAt) / 1000) + ' seconds'
        });
        return false;
      }

  
      if (this.isSuspiciousSession(sessionData)) {
        securityLogger.log('suspicious_session_detected', {
          userId,
          sessionId: token.substring(0, 8) + '...'
        }, 'warn');
        return false;
      }

  
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
    
  
    const hexPattern = /^[a-f0-9]+$/i;
    return hexPattern.test(token);
  }

  isSuspiciousSession(sessionData) {
    const sessionId = sessionData.token;
    
  
    if (this.suspiciousSessions.has(sessionId)) {
      return true;
    }


    const recentSessions = Array.from(this.activeSessions.values())
      .filter(session => 
        session.userId === sessionData.userId &&
        Date.now() - session.createdAt < 5 * 60 * 1000
      );

    if (recentSessions.length > 5) {
      this.markSessionSuspicious(sessionId, 'rapid_session_creation');
      return true;
    }


    if (this.hasUnusualDurationPattern(sessionData)) {
      this.markSessionSuspicious(sessionId, 'unusual_duration_pattern');
      return true;
    }

    return false;
  }

  hasUnusualDurationPattern(sessionData) {
    const { expiresAt, timestamp, rememberMe } = sessionData;
    const sessionDuration = expiresAt - (timestamp || Date.now());
    
    if (!rememberMe && sessionDuration > 7 * 24 * 60 * 60 * 1000) {
      return true;
    }

    if (sessionDuration < 5 * 60 * 1000) {
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


    const inactiveSessions = Array.from(this.activeSessions.entries())
      .filter(([token, session]) => {
        const inactiveTime = now - session.lastActivity;
        return inactiveTime > 2 * 60 * 60 * 1000;
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


    anomalies.forEach(anomaly => {
      securityLogger.log('session_anomaly_detected', anomaly, 'warn');
    });
  }

  sanitizeSessionData(sessionData) {
    if (!sessionData || typeof sessionData !== 'object') {
      return sessionData;
    }

    const sanitized = { ...sessionData };
    

    if (sanitized.token) {
      sanitized.token = sanitized.token.substring(0, 8) + '...';
    }
    
    return sanitized;
  }


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
  
      if (session.rememberMe) {
        stats.sessionsByType.persistent++;
      } else {
        stats.sessionsByType.regular++;
      }

  
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


const sessionSecurity = new SessionSecurity();

export default sessionSecurity;