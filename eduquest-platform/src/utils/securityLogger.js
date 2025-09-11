/**
 * Enhanced Security Logger
 * Provides comprehensive logging and monitoring for security events
 */

class SecurityLogger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
    this.maxLogSize = 1000;
    this.logs = [];
    this.securityEvents = new Map();
    this.suspiciousActivities = [];
    

    this.initializeMonitoring();
  }

  initializeMonitoring() {

    setInterval(() => {
      this.cleanupOldLogs();
    }, 60000);


    setInterval(() => {
      this.analyzeSuspiciousPatterns();
    }, 300000);
  }

  log(eventType, data = {}, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      id: this.generateLogId(),
      timestamp,
      eventType,
      level,
      data: this.sanitizeLogData(data),
      userAgent: this.getUserAgent(),
      ip: this.getClientIP(),
      sessionId: this.getSessionId()
    };


    this.logs.push(logEntry);
    

    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }


    this.trackSecurityEvent(eventType, logEntry);


    this.consoleLog(logEntry);


    this.checkSecurityThreats(eventType, data);

    return logEntry.id;
  }


  trackSecurityEvent(eventType, logEntry) {
    const securityEvents = [
      'login_attempt', 'login_success', 'login_failure',
      'account_locked', 'rate_limit_exceeded',
      'session_created', 'session_expired', 'session_refreshed',
      'password_change', 'suspicious_activity',
      'xss_attempt', 'sql_injection_attempt',
      'csrf_token_mismatch', 'unauthorized_access'
    ];

    if (securityEvents.includes(eventType)) {
      if (!this.securityEvents.has(eventType)) {
        this.securityEvents.set(eventType, []);
      }
      
      const events = this.securityEvents.get(eventType);
      events.push(logEntry);
      
  
      if (events.length > 100) {
        events.shift();
      }
    }
  }


  logError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString()
    };

    this.log('application_error', errorData, 'error');
    

    this.analyzeErrorForSecurity(error, context);
  }


  checkSecurityThreats(eventType, data) {
    const threats = {
      'login_failure': () => this.checkBruteForceAttempt(data),
      'rate_limit_exceeded': () => this.checkDDoSAttempt(data),
      'xss_attempt': () => this.checkXSSAttempt(data),
      'sql_injection_attempt': () => this.checkSQLInjection(data)
    };

    if (threats[eventType]) {
      threats[eventType]();
    }
  }

  checkBruteForceAttempt(data) {
    const recentFailures = this.getRecentEvents('login_failure', 15 * 60 * 1000);
    const failuresFromIP = recentFailures.filter(event => 
      event.ip === this.getClientIP()
    );

    if (failuresFromIP.length >= 10) {
      this.log('suspicious_activity', {
        type: 'potential_brute_force',
        ip: this.getClientIP(),
        failureCount: failuresFromIP.length,
        timeWindow: '15 minutes'
      }, 'warn');
    }
  }

  checkDDoSAttempt(data) {
    const recentRateLimits = this.getRecentEvents('rate_limit_exceeded', 5 * 60 * 1000);
    
    if (recentRateLimits.length >= 50) {
      this.log('suspicious_activity', {
        type: 'potential_ddos',
        eventCount: recentRateLimits.length,
        timeWindow: '5 minutes'
      }, 'error');
    }
  }

  checkXSSAttempt(data) {
    this.log('security_violation', {
      type: 'xss_attempt',
      details: data,
      severity: 'high'
    }, 'error');
  }

  checkSQLInjection(data) {
    this.log('security_violation', {
      type: 'sql_injection_attempt',
      details: data,
      severity: 'critical'
    }, 'error');
  }


  analyzeSuspiciousPatterns() {
    const patterns = [
      this.detectUnusualLoginPatterns(),
      this.detectSessionAnomalies(),
      this.detectRapidFireRequests()
    ];

    patterns.forEach(pattern => {
      if (pattern.detected) {
        this.log('suspicious_pattern', pattern, 'warn');
      }
    });
  }

  detectUnusualLoginPatterns() {
    const recentLogins = this.getRecentEvents('login_success', 24 * 60 * 60 * 1000);
    const ipCounts = {};
    
    recentLogins.forEach(login => {
      const ip = login.ip;
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });

    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([ip, count]) => count > 20)
      .map(([ip, count]) => ({ ip, count }));

    return {
      detected: suspiciousIPs.length > 0,
      type: 'unusual_login_frequency',
      details: suspiciousIPs
    };
  }

  detectSessionAnomalies() {
    const recentSessions = this.getRecentEvents('session_created', 60 * 60 * 1000);
    const shortSessions = recentSessions.filter(session => {
      const sessionEnd = this.findSessionEnd(session.data.sessionId);
      if (sessionEnd) {
        const duration = new Date(sessionEnd.timestamp) - new Date(session.timestamp);
        return duration < 30000;
      }
      return false;
    });

    return {
      detected: shortSessions.length > 10,
      type: 'unusual_session_pattern',
      details: { shortSessionCount: shortSessions.length }
    };
  }

  detectRapidFireRequests() {
    const recentLogs = this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return logTime > fiveMinutesAgo;
    });

    const requestsPerMinute = recentLogs.length / 5;
    
    return {
      detected: requestsPerMinute > 100,
      type: 'rapid_fire_requests',
      details: { requestsPerMinute: Math.round(requestsPerMinute) }
    };
  }


  getRecentEvents(eventType, timeWindow) {
    const cutoffTime = new Date(Date.now() - timeWindow);
    const events = this.securityEvents.get(eventType) || [];
    
    return events.filter(event => 
      new Date(event.timestamp) > cutoffTime
    );
  }

  findSessionEnd(sessionId) {
    return this.logs.find(log => 
      log.data.sessionId === sessionId && 
      (log.eventType === 'session_expired' || log.eventType === 'logout')
    );
  }

  sanitizeLogData(data) {
    const sanitized = { ...data };
    
  
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'hash'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 8) {
          sanitized[key] = sanitized[key].substring(0, 8) + '...';
        } else {
          sanitized[key] = '[REDACTED]';
        }
      }
    });

    return sanitized;
  }

  generateLogId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getUserAgent() {
    if (typeof window !== 'undefined' && window.navigator) {
      return window.navigator.userAgent;
    }
    return 'Unknown';
  }

  getClientIP() {
  
    return 'client-side';
  }

  getSessionId() {
    try {
      const session = JSON.parse(localStorage.getItem('eduquest_session') || '{}');
      return session.token ? session.token.substring(0, 8) + '...' : null;
    } catch {
      return null;
    }
  }

  consoleLog(logEntry) {
    const { level, eventType, timestamp, data } = logEntry;
    const message = `[${timestamp}] ${eventType.toUpperCase()}`;
    
    switch (level) {
      case 'error':
        console.error(message, data);
        break;
      case 'warn':
        console.warn(message, data);
        break;
      case 'debug':
        if (this.logLevel === 'debug') {
          console.debug(message, data);
        }
        break;
      default:
        console.log(message, data);
    }
  }

  analyzeErrorForSecurity(error, context) {
    const securityIndicators = [
      'unauthorized', 'forbidden', 'csrf', 'xss', 'injection',
      'malicious', 'suspicious', 'attack', 'breach'
    ];

    const errorText = (error.message + error.stack).toLowerCase();
    const hasSecurityIndicator = securityIndicators.some(indicator => 
      errorText.includes(indicator)
    );

    if (hasSecurityIndicator) {
      this.log('security_related_error', {
        error: error.message,
        context,
        indicators: securityIndicators.filter(indicator => 
          errorText.includes(indicator)
        )
      }, 'error');
    }
  }

  cleanupOldLogs() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    

    this.logs = this.logs.filter(log => 
      new Date(log.timestamp) > oneHourAgo
    );


    this.securityEvents.forEach((events, eventType) => {
      const recentEvents = events.filter(event => 
        new Date(event.timestamp) > oneHourAgo
      );
      this.securityEvents.set(eventType, recentEvents);
    });
  }


  getLogs(eventType = null, limit = 50) {
    let logs = eventType ? 
      this.logs.filter(log => log.eventType === eventType) : 
      this.logs;
    
    return logs.slice(-limit).reverse();
  }

  getSecuritySummary() {
    const summary = {
      totalLogs: this.logs.length,
      securityEvents: {},
      recentThreats: [],
      systemHealth: 'good'
    };

  
    this.securityEvents.forEach((events, eventType) => {
      summary.securityEvents[eventType] = events.length;
    });

  
    const recentThreats = this.logs.filter(log => 
      log.eventType === 'suspicious_activity' || 
      log.eventType === 'security_violation'
    ).slice(-10);
    
    summary.recentThreats = recentThreats;

  
    if (recentThreats.length > 5) {
      summary.systemHealth = 'warning';
    }
    if (recentThreats.some(threat => threat.level === 'error')) {
      summary.systemHealth = 'critical';
    }

    return summary;
  }
}


const securityLogger = new SecurityLogger();

export default securityLogger;