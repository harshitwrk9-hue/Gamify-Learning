import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaFire, 
  FaStar,
  FaUsers,
  FaCalendarWeek,
  FaCalendarDay,
  FaGlobeAmericas,
  FaUserFriends,
  FaSchool,
  FaChevronUp,
  FaChevronDown,
  FaEquals,
  FaShare,
  FaHeart,
  FaComment,
  FaEye,
  FaFilter,
  FaSearch,
  FaSyncAlt
} from 'react-icons/fa';
import './SocialLeaderboard.css';

const SocialLeaderboard = ({ 
  currentUser = {},
  onChallengeUser,
  onFollowUser,
  onShareAchievement
}) => {
  const [activeTab, setActiveTab] = useState('global');
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);


  const mockLeaderboardData = {
    global: {
      weekly: [
        {
          id: 1,
          name: 'Arjun Sharma',
          avatar: '👨‍💻',
          xp: 15420,
          level: 28,
          streak: 15,
          badges: 24,
          weeklyXP: 2840,
          rank: 1,
          previousRank: 3,
          school: 'IIT Delhi',
          country: '🇮🇳',
          isOnline: true,
          achievements: ['Speed Demon', 'Perfect Score', 'Scholar'],
          specialties: ['Mathematics', 'Physics']
        },
        {
          id: 2,
          name: 'Priya Patel',
          avatar: '👩‍🎓',
          xp: 14890,
          level: 27,
          streak: 22,
          badges: 31,
          weeklyXP: 2650,
          rank: 2,
          previousRank: 1,
          school: 'IIT Bombay',
          country: '🇮🇳',
          isOnline: false,
          achievements: ['Unstoppable', 'Math Master', 'Night Owl'],
          specialties: ['Computer Science', 'Mathematics']
        },
        {
          id: 3,
          name: 'Vikram Singh',
          avatar: '👨‍🔬',
          xp: 14200,
          level: 26,
          streak: 8,
          badges: 19,
          weeklyXP: 2420,
          rank: 3,
          previousRank: 4,
          school: 'AIIMS Delhi',
          country: '🇮🇳',
          isOnline: true,
          achievements: ['Science Wizard', 'Early Bird', 'Quick Learner'],
          specialties: ['Chemistry', 'Biology']
        },
        {
          id: 4,
          name: 'Ananya Gupta',
          avatar: '👩‍💼',
          xp: 13850,
          level: 25,
          streak: 12,
          badges: 22,
          weeklyXP: 2180,
          rank: 4,
          previousRank: 2,
          school: 'JNU Delhi',
          country: '🇮🇳',
          isOnline: true,
          achievements: ['Social Butterfly', 'Perfectionist', 'Scholar'],
          specialties: ['Literature', 'History']
        },
        {
          id: 5,
          name: 'Rajesh Kumar',
          avatar: '👨‍🎨',
          xp: 13420,
          level: 24,
          streak: 6,
          badges: 18,
          weeklyXP: 1950,
          rank: 5,
          previousRank: 6,
          school: 'NID Ahmedabad',
          country: '🇮🇳',
          isOnline: false,
          achievements: ['Creative Genius', 'Art Master', 'Consistent'],
          specialties: ['Art', 'Design']
        }
      ]
    },
    friends: {
      weekly: [
        {
          id: 2,
          name: 'Priya Patel',
          avatar: '👩‍🎓',
          xp: 14890,
          level: 27,
          streak: 22,
          badges: 31,
          weeklyXP: 2650,
          rank: 1,
          previousRank: 2,
          isFriend: true,
          mutualFriends: 8
        },
        {
          id: 6,
          name: 'Rohit Sharma',
          avatar: '👨‍🏫',
          xp: 12800,
          level: 23,
          streak: 18,
          badges: 16,
          weeklyXP: 1820,
          rank: 2,
          previousRank: 1,
          isFriend: true,
          mutualFriends: 12
        }
      ]
    },
    school: {
      weekly: [
        {
          id: 7,
          name: 'Kavya Nair',
          avatar: '👩‍🔬',
          xp: 16200,
          level: 29,
          streak: 25,
          badges: 28,
          weeklyXP: 3100,
          rank: 1,
          previousRank: 1,
          school: 'IIT Madras',
          year: 'Senior'
        }
      ]
    }
  };

  const mockActivities = [
    {
      id: 1,
      user: 'Arjun Sharma',
      avatar: '👨‍💻',
      action: 'unlocked',
      target: 'Speed Demon badge',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      user: 'Priya Patel',
      avatar: '👩‍🎓',
      action: 'reached',
      target: 'Level 27',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 1
    },
    {
      id: 3,
      user: 'Vikram Singh',
      avatar: '👨‍🔬',
      action: 'completed',
      target: '50 Chemistry quizzes',
      timestamp: '6 hours ago',
      likes: 15,
      comments: 5
    }
  ];

  const tabs = {
    global: { icon: FaGlobeAmericas, label: 'Global' },
    friends: { icon: FaUserFriends, label: 'Friends' },
    school: { icon: FaSchool, label: 'School' }
  };

  const timeFrames = {
    daily: { icon: FaCalendarDay, label: 'Today' },
    weekly: { icon: FaCalendarWeek, label: 'This Week' },
    monthly: { icon: FaUsers, label: 'This Month' }
  };


  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      const data = mockLeaderboardData[activeTab]?.[timeFrame] || [];
      setLeaderboardData(data);
      
  
      const userIndex = data.findIndex(user => user.id === currentUser.id);
      if (userIndex !== -1) {
        setUserRank({
          ...data[userIndex],
          position: userIndex + 1
        });
      } else {
  
        setUserRank({
          ...currentUser,
          position: Math.floor(Math.random() * 1000) + 100,
          rank: Math.floor(Math.random() * 1000) + 100
        });
      }
      
      setIsLoading(false);
    }, 500);
  }, [activeTab, timeFrame, currentUser.id]);


  useEffect(() => {
    setRecentActivities(mockActivities);
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FaCrown className="rank-icon gold" />;
      case 2: return <FaTrophy className="rank-icon silver" />;
      case 3: return <FaMedal className="rank-icon bronze" />;
      default: return <span className="rank-number">#{rank}</span>;
    }
  };

  const getRankChange = (current, previous) => {
    if (current < previous) {
      return <FaChevronUp className="rank-change up" />;
    } else if (current > previous) {
      return <FaChevronDown className="rank-change down" />;
    }
    return <FaEquals className="rank-change same" />;
  };

  const handleChallenge = (user) => {
    setShowChallengeModal(user);
  };

  const handleFollow = (userId) => {
    if (onFollowUser) {
      onFollowUser(userId);
    }
  };

  const handleShare = (achievement) => {
    if (onShareAchievement) {
      onShareAchievement(achievement);
    }
  };

  const filteredData = leaderboardData.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || user.specialties?.includes(filterCategory))
  );

  return (
    <div className="social-leaderboard">

      <div className="leaderboard-header">
        <div className="header-title">
          <FaTrophy className="header-icon" />
          <h2>Leaderboard</h2>
        </div>
        
        <div className="header-controls">
          <button 
            className="refresh-btn"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <FaSyncAlt className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>


      <div className="tab-navigation">
        {Object.entries(tabs).map(([key, tab]) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <IconComponent className="tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>


      <div className="time-frame-selection">
        {Object.entries(timeFrames).map(([key, frame]) => {
          const IconComponent = frame.icon;
          return (
            <button
              key={key}
              className={`time-btn ${timeFrame === key ? 'active' : ''}`}
              onClick={() => setTimeFrame(key)}
            >
              <IconComponent className="time-icon" />
              {frame.label}
            </button>
          );
        })}
      </div>


      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Literature">Literature</option>
          <option value="History">History</option>
        </select>
      </div>

      <div className="leaderboard-content">
  
        {userRank && (
          <motion.div 
            className="current-user-rank"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="rank-header">
              <h3>Your Rank</h3>
              {getRankChange(userRank.rank, userRank.previousRank || userRank.rank)}
            </div>
            
            <div className="user-rank-card">
              <div className="rank-position">
                {getRankIcon(userRank.position)}
              </div>
              
              <div className="user-info">
                <div className="user-avatar">{currentUser.avatar || '👤'}</div>
                <div className="user-details">
                  <h4>{currentUser.name || 'You'}</h4>
                  <div className="user-stats">
                    <span><FaStar /> {userRank.xp || 0} XP</span>
                    <span><FaFire /> {userRank.streak || 0} day streak</span>
                  </div>
                </div>
              </div>
              
              <div className="rank-progress">
                <div className="progress-item">
                  <span className="progress-label">Level {userRank.level || 1}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${((userRank.xp || 0) % 1000) / 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

  
        <div className="leaderboard-list">
          <AnimatePresence>
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading leaderboard...</p>
              </div>
            ) : (
              filteredData.map((user, index) => (
                <motion.div
                  key={user.id}
                  className={`leaderboard-item ${user.id === currentUser.id ? 'current-user' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="rank-section">
                    {getRankIcon(user.rank)}
                    {getRankChange(user.rank, user.previousRank)}
                  </div>
                  
                  <div className="user-section">
                    <div className="user-avatar-container">
                      <div className="user-avatar">{user.avatar}</div>
                      {user.isOnline && <div className="online-indicator"></div>}
                    </div>
                    
                    <div className="user-info">
                      <div className="user-name-row">
                        <h4>{user.name}</h4>
                        {user.country && <span className="country-flag">{user.country}</span>}
                      </div>
                      
                      <div className="user-details">
                        {user.school && <span className="school">{user.school}</span>}
                        {user.year && <span className="year">{user.year}</span>}
                        {user.mutualFriends && (
                          <span className="mutual-friends">
                            {user.mutualFriends} mutual friends
                          </span>
                        )}
                      </div>
                      
                      {user.specialties && (
                        <div className="specialties">
                          {user.specialties.slice(0, 2).map(specialty => (
                            <span key={specialty} className="specialty-tag">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="stats-section">
                    <div className="stat-item">
                      <FaStar className="stat-icon" />
                      <div>
                        <span className="stat-value">{user.xp.toLocaleString()}</span>
                        <span className="stat-label">XP</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <FaFire className="stat-icon" />
                      <div>
                        <span className="stat-value">{user.streak}</span>
                        <span className="stat-label">Streak</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <FaTrophy className="stat-icon" />
                      <div>
                        <span className="stat-value">{user.badges}</span>
                        <span className="stat-label">Badges</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="actions-section">
                    {user.id !== currentUser.id && (
                      <>
                        <button 
                          className="action-btn challenge"
                          onClick={() => handleChallenge(user)}
                          title="Challenge to a quiz duel"
                        >
                          ⚔️
                        </button>
                        
                        <button 
                          className="action-btn follow"
                          onClick={() => handleFollow(user.id)}
                          title={user.isFriend ? 'Following' : 'Follow'}
                        >
                          {user.isFriend ? '✓' : '+'}
                        </button>
                      </>
                    )}
                    
                    <button 
                      className="action-btn share"
                      onClick={() => handleShare(user.achievements?.[0])}
                      title="Share achievement"
                    >
                      <FaShare />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

  
        <div className="recent-activities">
          <h3>Recent Activities</h3>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <motion.div 
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="activity-avatar">{activity.avatar}</div>
                <div className="activity-content">
                  <p>
                    <strong>{activity.user}</strong> {activity.action} <em>{activity.target}</em>
                  </p>
                  <div className="activity-meta">
                    <span className="timestamp">{activity.timestamp}</span>
                    <div className="activity-actions">
                      <button className="activity-action">
                        <FaHeart /> {activity.likes}
                      </button>
                      <button className="activity-action">
                        <FaComment /> {activity.comments}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      <AnimatePresence>
        {showChallengeModal && (
          <motion.div
            className="challenge-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowChallengeModal(null)}
          >
            <motion.div
              className="challenge-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Challenge {showChallengeModal.name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowChallengeModal(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="challenge-preview">
                  <div className="challenger">
                    <div className="user-avatar">{currentUser.avatar || '👤'}</div>
                    <span>{currentUser.name || 'You'}</span>
                  </div>
                  
                  <div className="vs-indicator">VS</div>
                  
                  <div className="opponent">
                    <div className="user-avatar">{showChallengeModal.avatar}</div>
                    <span>{showChallengeModal.name}</span>
                  </div>
                </div>
                
                <div className="challenge-options">
                  <h4>Choose Challenge Type:</h4>
                  <div className="challenge-types">
                    <button className="challenge-type-btn">
                      <FaFire className="challenge-icon" />
                      <div>
                        <strong>Speed Quiz</strong>
                        <p>Race to answer 10 questions fastest</p>
                      </div>
                    </button>
                    
                    <button className="challenge-type-btn">
                      <FaStar className="challenge-icon" />
                      <div>
                        <strong>Accuracy Challenge</strong>
                        <p>Highest score wins</p>
                      </div>
                    </button>
                    
                    <button className="challenge-type-btn">
                      <FaTrophy className="challenge-icon" />
                      <div>
                        <strong>Subject Duel</strong>
                        <p>Battle in your strongest subject</p>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowChallengeModal(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="send-challenge-btn"
                    onClick={() => {
                      if (onChallengeUser) {
                        onChallengeUser(showChallengeModal.id);
                      }
                      setShowChallengeModal(null);
                    }}
                  >
                    Send Challenge
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialLeaderboard;