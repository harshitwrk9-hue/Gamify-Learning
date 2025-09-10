import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaFire, 
  FaStar, 
  FaUsers, 
  FaChevronUp,
  FaChevronDown,
  FaEquals,
  FaGem,
  FaCoins
} from 'react-icons/fa';
import './Leaderboard.css';

const Leaderboard = ({ 
  currentUserId = 'user1',
  timeframe = 'weekly' // weekly, monthly, allTime
}) => {
  const [selectedTab, setSelectedTab] = useState(timeframe);
  const [animateRankings, setAnimateRankings] = useState(false);

  // Mock leaderboard data
  const leaderboardData = {
    weekly: [
      {
        id: 'user1',
        name: 'You',
        avatar: '👤',
        xp: 2450,
        level: 12,
        streak: 7,
        rank: 3,
        previousRank: 5,
        badges: 8,
        completedCourses: 4
      },
      {
        id: 'user2',
        name: 'Sarah Chen',
        avatar: '👩‍💻',
        xp: 3200,
        level: 15,
        streak: 12,
        rank: 1,
        previousRank: 2,
        badges: 12,
        completedCourses: 6
      },
      {
        id: 'user3',
        name: 'Alex Rodriguez',
        avatar: '👨‍🎓',
        xp: 2800,
        level: 13,
        streak: 9,
        rank: 2,
        previousRank: 1,
        badges: 10,
        completedCourses: 5
      },
      {
        id: 'user4',
        name: 'Emma Wilson',
        avatar: '👩‍🔬',
        xp: 2100,
        level: 11,
        streak: 5,
        rank: 4,
        previousRank: 4,
        badges: 7,
        completedCourses: 3
      },
      {
        id: 'user5',
        name: 'David Kim',
        avatar: '👨‍💼',
        xp: 1950,
        level: 10,
        streak: 8,
        rank: 5,
        previousRank: 3,
        badges: 6,
        completedCourses: 3
      }
    ],
    monthly: [
      {
        id: 'user2',
        name: 'Sarah Chen',
        avatar: '👩‍💻',
        xp: 12500,
        level: 15,
        streak: 25,
        rank: 1,
        previousRank: 1,
        badges: 15,
        completedCourses: 8
      },
      {
        id: 'user1',
        name: 'You',
        avatar: '👤',
        xp: 9800,
        level: 12,
        streak: 18,
        rank: 2,
        previousRank: 3,
        badges: 12,
        completedCourses: 6
      },
      {
        id: 'user3',
        name: 'Alex Rodriguez',
        avatar: '👨‍🎓',
        xp: 9200,
        level: 13,
        streak: 20,
        rank: 3,
        previousRank: 2,
        badges: 14,
        completedCourses: 7
      }
    ],
    allTime: [
      {
        id: 'user3',
        name: 'Alex Rodriguez',
        avatar: '👨‍🎓',
        xp: 45000,
        level: 25,
        streak: 45,
        rank: 1,
        previousRank: 1,
        badges: 25,
        completedCourses: 15
      },
      {
        id: 'user2',
        name: 'Sarah Chen',
        avatar: '👩‍💻',
        xp: 42000,
        level: 24,
        streak: 38,
        rank: 2,
        previousRank: 2,
        badges: 23,
        completedCourses: 14
      },
      {
        id: 'user1',
        name: 'You',
        avatar: '👤',
        xp: 28500,
        level: 18,
        streak: 28,
        rank: 3,
        previousRank: 4,
        badges: 18,
        completedCourses: 10
      }
    ]
  };

  const currentData = leaderboardData[selectedTab] || [];
  const currentUser = currentData.find(user => user.id === currentUserId);

  useEffect(() => {
    setAnimateRankings(true);
    const timer = setTimeout(() => setAnimateRankings(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedTab]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FaCrown className="rank-icon gold" />;
      case 2: return <FaMedal className="rank-icon silver" />;
      case 3: return <FaMedal className="rank-icon bronze" />;
      default: return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankChange = (current, previous) => {
    if (current < previous) {
      return { icon: <FaChevronUp />, class: 'rank-up', text: `+${previous - current}` };
    } else if (current > previous) {
      return { icon: <FaChevronDown />, class: 'rank-down', text: `-${current - previous}` };
    }
    return { icon: <FaEquals />, class: 'rank-same', text: '0' };
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'allTime': return 'All Time';
      default: return tab;
    }
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <div className="header-title">
          <FaTrophy className="leaderboard-icon" />
          <h3>Leaderboard</h3>
        </div>
        
        <div className="leaderboard-tabs">
          {['weekly', 'monthly', 'allTime'].map((tab) => (
            <motion.button
              key={tab}
              className={`tab-button ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getTabLabel(tab)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Current User Highlight */}
      {currentUser && (
        <motion.div 
          className="current-user-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="user-rank">
            {getRankIcon(currentUser.rank)}
          </div>
          <div className="user-avatar">{currentUser.avatar}</div>
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <div className="user-stats">
              <span className="user-xp">{currentUser.xp.toLocaleString()} XP</span>
              <span className="user-level">Level {currentUser.level}</span>
            </div>
          </div>
          <div className="rank-change">
            {(() => {
              const change = getRankChange(currentUser.rank, currentUser.previousRank);
              return (
                <div className={`rank-indicator ${change.class}`}>
                  {change.icon}
                  <span>{change.text}</span>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="leaderboard-list">
        <AnimatePresence mode="wait">
          {currentData.map((user, index) => {
            const isCurrentUser = user.id === currentUserId;
            const rankChange = getRankChange(user.rank, user.previousRank);
            
            return (
              <motion.div
                key={`${selectedTab}-${user.id}`}
                className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: animateRankings ? [1, 1.02, 1] : 1
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.3,
                  scale: { duration: 0.5, delay: index * 0.1 }
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="item-rank">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="item-avatar">
                  <img src={user.avatar} alt={user.name} className="avatar-image" />
                  {user.streak > 0 && (
                    <div className="streak-indicator">
                      <FaFire className="streak-icon" />
                      <span>{user.streak}</span>
                    </div>
                  )}
                </div>
                
                <div className="item-info">
                  <div className="item-name">{user.name}</div>
                  <div className="item-details">
                    <span className="item-level">Level {user.level}</span>
                    <span className="item-badges">
                      <FaStar /> {user.badges}
                    </span>
                    <span className="item-courses">
                      <FaGem /> {user.completedCourses}
                    </span>
                  </div>
                </div>
                
                <div className="item-stats">
                  <div className="item-xp">{user.xp.toLocaleString()}</div>
                  <div className="xp-label">XP</div>
                </div>
                
                <div className={`item-change ${rankChange.class}`}>
                  {rankChange.icon}
                  <span className="change-text">{rankChange.text}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Leaderboard Footer */}
      <div className="leaderboard-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <FaUsers className="stat-icon" />
            <span>{currentData.length} Active Learners</span>
          </div>
          <div className="stat-item">
            <FaCoins className="stat-icon" />
            <span>Compete for Rewards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;