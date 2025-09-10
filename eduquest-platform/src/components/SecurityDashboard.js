/**
 * Security Monitoring Dashboard
 * Provides real-time security monitoring and threat detection interface
 */

import React, { useState, useEffect } from 'react';
import securityLogger from '../utils/securityLogger';
import sessionSecurity from '../utils/sessionSecurity';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
  const [securityData, setSecurityData] = useState({
    logs: [],
    sessionStats: {},
    securitySummary: {},
    threats: [],
    isLoading: true
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSecurityData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadSecurityData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const loadSecurityData = async () => {
    try {
      setSecurityData(prev => ({ ...prev, isLoading: true }));
      
      // Get security data
      const logs = securityLogger.getLogs(null, 100);
      const sessionStats = sessionSecurity.getSessionStats();
      const securitySummary = securityLogger.getSecuritySummary();
      const threats = securitySummary.recentThreats || [];

      setSecurityData({
        logs,
        sessionStats,
        securitySummary,
        threats,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load security data:', error);
      setSecurityData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getSystemHealthColor = (health) => {
    switch (health) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      'login_success': '✅',
      'login_failure': '❌',
      'account_locked': '🔒',
      'rate_limit_exceeded': '⚠️',
      'suspicious_activity': '🚨',
      'security_violation': '🛡️',
      'session_created': '🔑',
      'session_expired': '⏰',
      'session_refreshed': '🔄',
      'application_error': '💥',
      'xss_attempt': '🕷️',
      'sql_injection_attempt': '💉'
    };
    return icons[eventType] || '📝';
  };

  const renderOverview = () => (
    <div className="security-overview">
      <div className="security-metrics">
        <div className="metric-card">
          <div className="metric-header">
            <h3>System Health</h3>
            <div 
              className="health-indicator"
              style={{ backgroundColor: getSystemHealthColor(securityData.securitySummary.systemHealth) }}
            >
              {securityData.securitySummary.systemHealth?.toUpperCase() || 'UNKNOWN'}
            </div>
          </div>
          <div className="metric-details">
            <p>Total Security Events: {securityData.securitySummary.totalLogs || 0}</p>
            <p>Active Sessions: {securityData.sessionStats.totalActiveSessions || 0}</p>
            <p>Suspicious Sessions: {securityData.sessionStats.suspiciousSessions || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Session Statistics</h3>
          </div>
          <div className="metric-details">
            <p>Regular Sessions: {securityData.sessionStats.sessionsByType?.regular || 0}</p>
            <p>Persistent Sessions: {securityData.sessionStats.sessionsByType?.persistent || 0}</p>
            <p>Average Session Age: {securityData.sessionStats.averageSessionAge || 'N/A'}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Recent Threats</h3>
          </div>
          <div className="metric-details">
            <p>Active Threats: {securityData.threats.length}</p>
            {securityData.threats.slice(0, 3).map((threat, index) => (
              <div key={index} className="threat-preview">
                <span className="threat-icon">{getEventTypeIcon(threat.eventType)}</span>
                <span className="threat-type">{threat.eventType.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="security-events-chart">
        <h3>Security Events by Type</h3>
        <div className="events-breakdown">
          {Object.entries(securityData.securitySummary.securityEvents || {}).map(([eventType, count]) => (
            <div key={eventType} className="event-bar">
              <div className="event-label">
                <span className="event-icon">{getEventTypeIcon(eventType)}</span>
                <span className="event-name">{eventType.replace(/_/g, ' ')}</span>
              </div>
              <div className="event-count-bar">
                <div 
                  className="event-count-fill"
                  style={{ 
                    width: `${Math.min(100, (count / Math.max(...Object.values(securityData.securitySummary.securityEvents || {}))) * 100)}%` 
                  }}
                ></div>
                <span className="event-count">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="security-logs">
      <div className="logs-header">
        <h3>Security Event Logs</h3>
        <div className="logs-controls">
          <button onClick={loadSecurityData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>
      <div className="logs-container">
        {securityData.logs.length === 0 ? (
          <div className="no-logs">No security events recorded</div>
        ) : (
          <div className="logs-list">
            {securityData.logs.map((log) => (
              <div key={log.id} className={`log-entry log-${log.level}`}>
                <div className="log-header">
                  <span className="log-icon">{getEventTypeIcon(log.eventType)}</span>
                  <span className="log-type">{log.eventType.replace(/_/g, ' ')}</span>
                  <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                  <span className={`log-level level-${log.level}`}>{log.level.toUpperCase()}</span>
                </div>
                <div className="log-details">
                  {Object.entries(log.data || {}).map(([key, value]) => (
                    <div key={key} className="log-detail">
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="security-threats">
      <div className="threats-header">
        <h3>Active Security Threats</h3>
        <div className="threat-summary">
          <span className={`threat-count ${securityData.threats.length > 0 ? 'has-threats' : ''}`}>
            {securityData.threats.length} Active Threats
          </span>
        </div>
      </div>
      <div className="threats-container">
        {securityData.threats.length === 0 ? (
          <div className="no-threats">
            <div className="no-threats-icon">🛡️</div>
            <p>No active security threats detected</p>
            <p className="no-threats-subtitle">System is operating normally</p>
          </div>
        ) : (
          <div className="threats-list">
            {securityData.threats.map((threat, index) => (
              <div key={index} className={`threat-card threat-${threat.level}`}>
                <div className="threat-header">
                  <span className="threat-icon">{getEventTypeIcon(threat.eventType)}</span>
                  <span className="threat-title">{threat.eventType.replace(/_/g, ' ')}</span>
                  <span className={`threat-severity severity-${threat.level}`}>
                    {threat.level.toUpperCase()}
                  </span>
                </div>
                <div className="threat-timestamp">
                  {formatTimestamp(threat.timestamp)}
                </div>
                <div className="threat-details">
                  {Object.entries(threat.data || {}).map(([key, value]) => (
                    <div key={key} className="threat-detail">
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="security-sessions">
      <div className="sessions-header">
        <h3>Session Management</h3>
        <div className="session-summary">
          <span className="session-stat">
            Active: {securityData.sessionStats.totalActiveSessions || 0}
          </span>
          <span className="session-stat suspicious">
            Suspicious: {securityData.sessionStats.suspiciousSessions || 0}
          </span>
        </div>
      </div>
      <div className="sessions-container">
        <div className="session-metrics">
          <div className="session-metric">
            <h4>Session Types</h4>
            <div className="session-type-breakdown">
              <div className="session-type">
                <span className="session-type-label">Regular Sessions:</span>
                <span className="session-type-count">{securityData.sessionStats.sessionsByType?.regular || 0}</span>
              </div>
              <div className="session-type">
                <span className="session-type-label">Persistent Sessions:</span>
                <span className="session-type-count">{securityData.sessionStats.sessionsByType?.persistent || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="session-metric">
            <h4>Session Ages</h4>
            <div className="session-age-info">
              <p><strong>Average Age:</strong> {securityData.sessionStats.averageSessionAge || 'N/A'}</p>
              {securityData.sessionStats.oldestSession && (
                <p><strong>Oldest Session:</strong> {securityData.sessionStats.oldestSession.age}</p>
              )}
              {securityData.sessionStats.newestSession && (
                <p><strong>Newest Session:</strong> {securityData.sessionStats.newestSession.age}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="security-dashboard">
      <div className="dashboard-header">
        <h1>Security Monitoring Dashboard</h1>
        <div className="dashboard-controls">
          <div className="auto-refresh-control">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto Refresh
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
            >
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
          </div>
          <button onClick={loadSecurityData} className="manual-refresh-btn">
            🔄 Refresh Now
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📝 Security Logs
        </button>
        <button
          className={`tab-button ${activeTab === 'threats' ? 'active' : ''}`}
          onClick={() => setActiveTab('threats')}
        >
          🚨 Threats ({securityData.threats.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          🔑 Sessions
        </button>
      </div>

      <div className="dashboard-content">
        {securityData.isLoading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading security data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'logs' && renderLogs()}
            {activeTab === 'threats' && renderThreats()}
            {activeTab === 'sessions' && renderSessions()}
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;