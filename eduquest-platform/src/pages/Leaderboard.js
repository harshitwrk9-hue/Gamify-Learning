import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaStar, 
  FaFire, 
  FaChartLine, 
  FaUsers, 
  FaCalendarWeek, 
  FaCalendarDay,
  FaGlobeAmericas,
  FaFilter,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaMapMarkerAlt,
  FaEye
} from 'react-icons/fa';
import { leaderboard, currentUser, badges, achievements } from '../data/mockData';
import './Leaderboard.css';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedLeaderboard, setSortedLeaderboard] = useState([]);
  const [nearbyRankings, setNearbyRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [leaderboardData, setLeaderboardData] = useState(leaderboard);

  useEffect(() => {
    // Sort and filter leaderboard data
    let filteredData = [...leaderboardData];
    
    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply time filter (simulate different data for different periods)
    if (timeFilter !== 'all-time') {
      // In a real app, this would filter by actual time periods
      // For demo, we'll just show different subsets
      const multiplier = timeFilter === 'this-week' ? 0.8 : timeFilter === 'this-month' ? 0.9 : timeFilter === 'today' ? 0.6 : 1;
      filteredData = filteredData.map(user => ({
        ...user,
        xp: Math.floor(user.xp * multiplier)
      }));
    }
    
    // Sort by XP (descending)
    filteredData.sort((a, b) => b.xp - a.xp);
    
    // Add global rank to each user
    filteredData = filteredData.map((user, index) => ({
      ...user,
      globalRank: index + 1,
      rank: index + 1,
      change: user.rankChange || Math.floor(Math.random() * 21) - 10
    }));
    
    setSortedLeaderboard(filteredData);
    
    // Find current user's rank
    const currentUserRank = filteredData.findIndex(u => u.id === currentUser.id) + 1;
    setUserRank(currentUserRank || null);
    
    // Generate nearby rankings (±5 positions from current user)
    if (currentUserRank > 0) {
      const nearbyStart = Math.max(0, currentUserRank - 6);
      const nearbyEnd = Math.min(filteredData.length, currentUserRank + 5);
      setNearbyRankings(filteredData.slice(nearbyStart, nearbyEnd));
    }
    
    // Update timestamp for real-time indicator
    setLastUpdated(new Date());
  }, [searchTerm, timeFilter, leaderboardData]);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small XP changes for random users
      const updatedLeaderboard = leaderboardData.map(user => {
        if (Math.random() < 0.3) { // 30% chance of XP change
          const xpChange = Math.floor(Math.random() * 50) - 25; // ±25 XP
          return {
            ...user,
            xp: Math.max(0, user.xp + xpChange),
            lastActive: new Date().toISOString(),
            rankChange: Math.floor(Math.random() * 21) - 10 // Random rank change
          };
        }
        return user;
      });
      
      // Update the leaderboard data state
      setLeaderboardData(updatedLeaderboard);
      
      // Trigger re-render by updating the timestamp
      setLastUpdated(new Date());
    }, 15000); // Update every 15 seconds
    
    return () => clearInterval(interval);
  }, [leaderboardData]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaCrown className="rank-icon gold" />;
      case 2:
        return <FaTrophy className="rank-icon silver" />;
      case 3:
        return <FaMedal className="rank-icon bronze" />;
      default:
        return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankChangeIcon = (change) => {
    if (change > 0) {
      return <FaArrowUp className="change-icon positive" />;
    } else if (change < 0) {
      return <FaArrowDown className="change-icon negative" />;
    } else {
      return <FaMinus className="change-icon neutral" />;
    }
  };

  const getLevel = (xp) => {
    return Math.floor(xp / 1000) + 1;
  };



  const getXPProgress = (xp) => {
    const currentLevelXP = (getLevel(xp) - 1) * 1000;
    const nextLevelXP = getLevel(xp) * 1000;
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  const tabs = [
    { id: 'global', label: 'Global', icon: FaGlobeAmericas },
    { id: 'nearby', label: 'Nearby', icon: FaMapMarkerAlt },
    { id: 'friends', label: 'Friends', icon: FaUsers },
    { id: 'weekly', label: 'Weekly', icon: FaCalendarWeek },
    { id: 'daily', label: 'Daily', icon: FaCalendarDay }
  ];
  
  const getDisplayData = () => {
    switch (activeTab) {
      case 'nearby':
        return nearbyRankings;
      case 'global':
      default:
        return sortedLeaderboard;
    }
  };
  
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const timeFilters = [
    { id: 'all-time', label: 'All Time' },
    { id: 'this-month', label: 'This Month' },
    { id: 'this-week', label: 'This Week' },
    { id: 'today', label: 'Today' }
  ];

  return (
    <motion.div 
      className="leaderboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="leaderboard-container">
        {/* Header */}
        <div className="leaderboard-header">
          <div className="header-content">
            <div className="title-section">
              <h1>
                <FaTrophy className="title-icon" />
                Leaderboard
              </h1>
              <p>Compete with learners worldwide and climb the ranks!</p>
            </div>
            
            <div className="user-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaChartLine />
                </div>
                <div className="stat-info">
                  <div className="stat-number">#{userRank || '---'}</div>
                  <div className="stat-label">Your Rank</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FaStar />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{currentUser.xp.toLocaleString()}</div>
                  <div className="stat-label">Total XP</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FaFire />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{currentUser.streak}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="leaderboard-nav">
          <div className="nav-tabs">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComponent className="tab-icon" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <div className="nav-controls">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="filters-section"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-group">
                <label>Time Period:</label>
                <div className="filter-options">
                  {timeFilters.map(filter => (
                    <button
                      key={filter.id}
                      className={`filter-option ${timeFilter === filter.id ? 'active' : ''}`}
                      onClick={() => setTimeFilter(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Leaderboard Section */}
        <motion.div 
          className="unified-leaderboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-header">
            <h2>
              <FaTrophy className="section-icon" />
              {activeTab === 'nearby' ? 'Nearby Rankings' : 
               activeTab === 'global' ? 'Global Rankings' :
               activeTab === 'friends' ? 'Friends Rankings' :
               activeTab === 'weekly' ? 'Weekly Rankings' :
               activeTab === 'daily' ? 'Daily Rankings' : 'Rankings'}
            </h2>
            <div className="section-stats">
              <span className="total-users">
                {getDisplayData().length} 
                {activeTab === 'nearby' ? 'nearby competitors' : 'learners competing'}
              </span>
              <div className="live-indicator">
                <div className="pulse-dot"></div>
                <span>Updated {getTimeAgo(lastUpdated)}</span>
              </div>
              {activeTab === 'nearby' && userRank && (
                <div className="user-position">
                  <FaEye className="position-icon" />
                  <span>Your position: #{userRank}</span>
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Highlight - Only show for global tab */}
          {activeTab === 'global' && (
            <div className="top-performers">
              {sortedLeaderboard.slice(0, 3).map((user, index) => (
                <motion.div 
                  key={user.id}
                  className={`top-performer rank-${index + 1}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="performer-rank">{getRankIcon(index + 1)}</div>
                  <div className="performer-avatar">
                    <img src={user.avatar} alt={user.name} />
                    {user.isOnline && <div className="online-status"></div>}
                  </div>
                  <div className="performer-info">
                    <h4>{user.name}</h4>
                    <div className="performer-stats">
                      <span className="level">Lv.{getLevel(user.xp)}</span>
                      <span className="xp">{user.xp.toLocaleString()} XP</span>
                    </div>
                    <div className="performer-badges">
                      {user.badges?.slice(0, 2).map((badgeId, badgeIndex) => {
                        const badge = badges.find(b => b.id === badgeId);
                        return badge ? (
                          <div key={badgeIndex} className="top-badge" title={badge.name}>
                            {badge.icon}
                          </div>
                        ) : null;
                      })}
                      {user.badges?.length > 2 && (
                        <span className="badge-count">+{user.badges.length - 2}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Complete Rankings */}
          <div className="rankings-container">
            <div className="rankings-header">
              <div className="col-rank">Rank</div>
              <div className="col-user">User</div>
              <div className="col-progress">Progress</div>
              <div className="col-achievements">Achievements</div>
              <div className="col-trend">Trend</div>
            </div>
            
            <div className="rankings-list">
              {getDisplayData().map((user, index) => {
                const displayRank = activeTab === 'nearby' ? user.globalRank : index + 1;
                const isTopThree = activeTab === 'global' && index < 3;
                
                const rankClass = displayRank <= 3 ? `rank-${displayRank}` : '';
                
                return (
                  <motion.div 
                    key={user.id}
                    className={`ranking-item ${user.id === currentUser.id ? 'current-user' : ''} ${isTopThree ? 'top-three' : ''} ${rankClass}`}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="rank-cell">
                      <span className="rank-number">#{displayRank}</span>
                      {isTopThree && <div className="rank-highlight"></div>}
                      {activeTab === 'nearby' && user.id === currentUser.id && (
                        <div className="you-indicator">YOU</div>
                      )}
                    </div>
                  
                  <div className="user-cell">
                    <div className="user-avatar-mini">
                      <img src={user.avatar} alt={user.name} />
                      {user.isOnline && <div className="online-indicator"></div>}
                    </div>
                    <div className="user-info">
                      <h3>
                        {user.name}
                        {user.id === currentUser.id && activeTab === 'nearby' && (
                          <span className="you-indicator">YOU</span>
                        )}
                      </h3>
                      <div className="user-location">
                        <FaMapMarkerAlt />
                        {user.country}
                        {user.isOnline && <span className="online-indicator"></span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="progress-cell">
                    <div className="level-badge">Lv.{getLevel(user.xp)}</div>
                    <div className="xp-info">
                      <div className="user-xp">
                        <span className="xp-amount">{user.xp.toLocaleString()}</span>
                        {user.xpChange && (
                          <span className={`xp-change ${user.xpChange > 0 ? 'positive' : 'negative'}`}>
                            {user.xpChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                            {Math.abs(user.xpChange)}
                          </span>
                        )}
                      </div>
                      <div className="xp-bar">
                        <div 
                          className="xp-fill"
                          style={{ width: `${getXPProgress(user.xp)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="achievements-cell">
                    <div className="achievement-summary">
                      <FaMedal className="medal-icon" />
                      <span className="badge-total">{user.badges?.length || 0}</span>
                    </div>
                    <div className="recent-achievements">
                      {achievements.slice(0, 1).map((achievement, achIndex) => (
                        <div key={achIndex} className="mini-achievement" title={achievement.title}>
                          {achievement.icon}
                          <span className="achievement-xp">+{achievement.xpReward}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="trend-cell">
                    <div className={`trend-indicator ${
                      user.change > 0 ? 'trending-up' : 
                      user.change < 0 ? 'trending-down' : 'stable'
                    }`}>
                      {getRankChangeIcon(user.change)}
                      <span className="trend-value">{Math.abs(user.change)}</span>
                    </div>
                    <div className="competition-status">
                      <FaFire className="competition-icon" />
                      <span className="competition-text">Active</span>
                    </div>
                  </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;