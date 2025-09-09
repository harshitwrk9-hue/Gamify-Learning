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
  FaMinus
} from 'react-icons/fa';
import { leaderboard, currentUser, badges, achievements } from '../data/mockData';
import './Leaderboard.css';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedLeaderboard, setSortedLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Sort and filter leaderboard data
    let filteredData = [...leaderboard];
    
    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by XP (descending)
    filteredData.sort((a, b) => b.xp - a.xp);
    
    // Add rank to each user
    filteredData = filteredData.map((user, index) => ({
      ...user,
      rank: index + 1,
      change: Math.floor(Math.random() * 21) - 10 // Random rank change for demo
    }));
    
    setSortedLeaderboard(filteredData);
    
    // Find current user's rank
    const currentUserRank = filteredData.findIndex(u => u.id === currentUser.id) + 1;
    setUserRank(currentUserRank || null);
  }, [searchTerm, timeFilter]);

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
    { id: 'friends', label: 'Friends', icon: FaUsers },
    { id: 'weekly', label: 'Weekly', icon: FaCalendarWeek },
    { id: 'daily', label: 'Daily', icon: FaCalendarDay }
  ];

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

        {/* Top 3 Podium */}
        <div className="podium-section">
          <h2>Top Performers</h2>
          <div className="podium">
            {sortedLeaderboard.slice(0, 3).map((user, index) => (
              <motion.div 
                key={user.id}
                className={`podium-place place-${index + 1}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="podium-user">
                  <div className="user-avatar">
                    <img src={user.avatar} alt={user.name} />
                    <div className="rank-badge">
                      {getRankIcon(index + 1)}
                    </div>
                  </div>
                  
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <div className="user-level">Level {getLevel(user.xp)}</div>
                    <div className="user-xp">{user.xp.toLocaleString()} XP</div>
                  </div>
                  
                  <div className="user-badges">
                    {user.badges?.slice(0, 3).map((badgeId, badgeIndex) => {
                      const badge = badges.find(b => b.id === badgeId);
                      return badge ? (
                        <div key={badgeIndex} className="mini-badge" title={badge.name}>
                          {badge.icon}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className={`podium-base base-${index + 1}`}>
                  <div className="base-number">{index + 1}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="leaderboard-list">
          <div className="list-header">
            <h2>All Rankings</h2>
            <div className="list-stats">
              <span>{sortedLeaderboard.length} learners</span>
            </div>
          </div>
          
          <div className="list-container">
            <div className="list-headers">
              <div className="header-rank">Rank</div>
              <div className="header-user">User</div>
              <div className="header-level">Level</div>
              <div className="header-xp">XP</div>
              <div className="header-change">Change</div>
              <div className="header-badges">Badges</div>
            </div>
            
            <div className="list-items">
              {sortedLeaderboard.map((listUser, index) => (
                <motion.div 
                  key={listUser.id}
                  className={`list-item ${listUser.id === currentUser.id ? 'current-user' : ''}`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="item-rank">
                    {getRankIcon(listUser.rank)}
                  </div>
                  
                  <div className="item-user">
                    <div className="user-avatar-small">
                      <img src={listUser.avatar} alt={listUser.name} />
                      {listUser.isOnline && <div className="online-indicator" />}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{listUser.name}</div>
                      <div className="user-country">{listUser.country}</div>
                    </div>
                  </div>
                  
                  <div className="item-level">
                    <div className="level-info">
                      <span className="level-number">Level {getLevel(listUser.xp)}</span>
                      <div className="level-progress">
                        <div 
                          className="level-progress-fill"
                          style={{ width: `${getXPProgress(listUser.xp)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="item-xp">
                    <span className="xp-amount">{listUser.xp.toLocaleString()}</span>
                    <span className="xp-label">XP</span>
                  </div>
                  
                  <div className="item-change">
                    {getRankChangeIcon(listUser.change)}
                    <span className={`change-number ${
                      listUser.change > 0 ? 'positive' : 
                      listUser.change < 0 ? 'negative' : 'neutral'
                    }`}>
                      {Math.abs(listUser.change)}
                    </span>
                  </div>
                  
                  <div className="item-badges">
                    <div className="badges-count">
                      <FaMedal className="badges-icon" />
                      <span>{listUser.badges?.length || 0}</span>
                    </div>
                    <div className="badges-preview">
                      {listUser.badges?.slice(0, 3).map((badgeId, badgeIndex) => {
                        const badge = badges.find(b => b.id === badgeId);
                        return badge ? (
                          <div key={badgeIndex} className="badge-mini" title={badge.name}>
                            {badge.icon}
                          </div>
                        ) : null;
                      })}
                      {listUser.badges?.length > 3 && (
                        <div className="badges-more">+{listUser.badges.length - 3}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Showcase */}
        <div className="achievements-section">
          <h2>Recent Achievements</h2>
          <div className="achievements-grid">
            {achievements.slice(0, 6).map((achievement, index) => (
              <motion.div 
                key={achievement.id}
                className="achievement-card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="achievement-icon">
                  {achievement.icon}
                </div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <div className="achievement-reward">
                    <FaStar className="reward-icon" />
                    <span>+{achievement.xpReward} XP</span>
                  </div>
                </div>
                <div className="achievement-rarity">
                  <span className={`rarity-badge ${achievement.rarity}`}>
                    {achievement.rarity}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Competition Info */}
        <div className="competition-section">
          <div className="competition-card">
            <div className="competition-header">
              <FaTrophy className="competition-icon" />
              <div>
                <h3>Weekly Challenge</h3>
                <p>Compete for the top spot this week!</p>
              </div>
            </div>
            
            <div className="competition-stats">
              <div className="stat">
                <span className="stat-number">2,847</span>
                <span className="stat-label">Participants</span>
              </div>
              <div className="stat">
                <span className="stat-number">3d 12h</span>
                <span className="stat-label">Time Left</span>
              </div>
              <div className="stat">
                <span className="stat-number">5,000 XP</span>
                <span className="stat-label">Prize Pool</span>
              </div>
            </div>
            
            <button className="join-competition-btn">
              <FaFire className="btn-icon" />
              Join Competition
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;