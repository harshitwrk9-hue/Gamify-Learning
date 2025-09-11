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
  
    let filteredData = [...leaderboardData];
    

    if (searchTerm) {
      filteredData = filteredData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    

    if (timeFilter !== 'all-time') {
  
  
      const multiplier = timeFilter === 'this-week' ? 0.8 : timeFilter === 'this-month' ? 0.9 : timeFilter === 'today' ? 0.6 : 1;
      filteredData = filteredData.map(user => ({
        ...user,
        xp: Math.floor(user.xp * multiplier)
      }));
    }
    

    filteredData.sort((a, b) => b.xp - a.xp);
    

    filteredData = filteredData.map((user, index) => ({
      ...user,
      globalRank: index + 1,
      rank: index + 1,
      change: user.rankChange || Math.floor(Math.random() * 21) - 10
    }));
    
    setSortedLeaderboard(filteredData);
    
  
    const currentUserRank = filteredData.findIndex(u => u.id === currentUser.id) + 1;
    setUserRank(currentUserRank || null);
    
  
    if (currentUserRank > 0) {
      const nearbyStart = Math.max(0, currentUserRank - 6);
      const nearbyEnd = Math.min(filteredData.length, currentUserRank + 5);
      setNearbyRankings(filteredData.slice(nearbyStart, nearbyEnd));
    }
    
  
    setLastUpdated(new Date());
  }, [searchTerm, timeFilter, leaderboardData]);
  

  useEffect(() => {
    const interval = setInterval(() => {
  
      const updatedLeaderboard = leaderboardData.map(user => {
        if (Math.random() < 0.3) {
          const xpChange = Math.floor(Math.random() * 50) - 25;
          return {
            ...user,
            xp: Math.max(0, user.xp + xpChange),
            lastActive: new Date().toISOString(),
            rankChange: Math.floor(Math.random() * 21) - 10
          };
        }
        return user;
      });
      
  
      setLeaderboardData(updatedLeaderboard);
      
  
      setLastUpdated(new Date());
    }, 15000);
    
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


          <div className="section-header">

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





          <div className="rankings-container">

            

          </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;