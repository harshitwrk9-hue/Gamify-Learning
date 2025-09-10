import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaMedal, 
  FaStar, 
  FaFire, 
  FaGraduationCap,
  FaLightbulb,
  FaClock,
  FaBullseye,
  FaRocket,
  FaCrown,
  FaGem,
  FaBolt,
  FaHeart,
  FaShieldAlt,
  FaFlag,
  FaLock,
  FaCheck
} from 'react-icons/fa';
import './AchievementBadges.css';

const AchievementBadges = ({ 
  userStats = {},
  onBadgeUnlock,
  showUnlockAnimation = true
}) => {
  const [unlockedBadges, setUnlockedBadges] = useState(new Set());
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(null);

  // Badge definitions with unlock conditions
  const badgeDefinitions = {
    // Learning Badges
    firstSteps: {
      id: 'firstSteps',
      name: 'First Steps',
      description: 'Complete your first quiz',
      icon: FaGraduationCap,
      category: 'learning',
      rarity: 'common',
      condition: (stats) => stats.quizzesCompleted >= 1,
      reward: { xp: 50, coins: 25 }
    },
    quickLearner: {
      id: 'quickLearner',
      name: 'Quick Learner',
      description: 'Complete 10 quizzes',
      icon: FaLightbulb,
      category: 'learning',
      rarity: 'common',
      condition: (stats) => stats.quizzesCompleted >= 10,
      reward: { xp: 100, coins: 50 }
    },
    scholar: {
      id: 'scholar',
      name: 'Scholar',
      description: 'Complete 50 quizzes',
      icon: FaTrophy,
      category: 'learning',
      rarity: 'rare',
      condition: (stats) => stats.quizzesCompleted >= 50,
      reward: { xp: 500, coins: 250, gems: 1 }
    },
    
    // Performance Badges
    perfectScore: {
      id: 'perfectScore',
      name: 'Perfect Score',
      description: 'Get 100% on any quiz',
      icon: FaStar,
      category: 'performance',
      rarity: 'uncommon',
      condition: (stats) => stats.perfectScores >= 1,
      reward: { xp: 150, coins: 75 }
    },
    perfectionist: {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 100% on 10 quizzes',
      icon: FaCrown,
      category: 'performance',
      rarity: 'epic',
      condition: (stats) => stats.perfectScores >= 10,
      reward: { xp: 1000, coins: 500, gems: 3 }
    },
    speedDemon: {
      id: 'speedDemon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: FaBolt,
      category: 'performance',
      rarity: 'rare',
      condition: (stats) => stats.fastestTime <= 120,
      reward: { xp: 200, coins: 100 }
    },
    
    // Streak Badges
    onFire: {
      id: 'onFire',
      name: 'On Fire',
      description: 'Maintain a 7-day learning streak',
      icon: FaFire,
      category: 'streak',
      rarity: 'uncommon',
      condition: (stats) => stats.currentStreak >= 7,
      reward: { xp: 300, coins: 150 }
    },
    unstoppable: {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Maintain a 30-day learning streak',
      icon: FaRocket,
      category: 'streak',
      rarity: 'legendary',
      condition: (stats) => stats.currentStreak >= 30,
      reward: { xp: 2000, coins: 1000, gems: 5 }
    },
    
    // Special Badges
    nightOwl: {
      id: 'nightOwl',
      name: 'Night Owl',
      description: 'Complete quizzes after 10 PM',
      icon: FaClock,
      category: 'special',
      rarity: 'uncommon',
      condition: (stats) => stats.lateNightQuizzes >= 5,
      reward: { xp: 150, coins: 75 }
    },
    earlyBird: {
      id: 'earlyBird',
      name: 'Early Bird',
      description: 'Complete quizzes before 7 AM',
      icon: FaBullseye,
      category: 'special',
      rarity: 'uncommon',
      condition: (stats) => stats.earlyMorningQuizzes >= 5,
      reward: { xp: 150, coins: 75 }
    },
    socialButterfly: {
      id: 'socialButterfly',
      name: 'Social Butterfly',
      description: 'Share 10 achievements',
      icon: FaHeart,
      category: 'social',
      rarity: 'rare',
      condition: (stats) => stats.achievementsShared >= 10,
      reward: { xp: 250, coins: 125 }
    },
    
    // Mastery Badges
    mathMaster: {
      id: 'mathMaster',
      name: 'Math Master',
      description: 'Complete 20 math quizzes with 80%+ average',
      icon: FaShieldAlt,
      category: 'mastery',
      rarity: 'epic',
      condition: (stats) => stats.mathQuizzes >= 20 && stats.mathAverage >= 80,
      reward: { xp: 800, coins: 400, gems: 2 }
    },
    scienceWizard: {
      id: 'scienceWizard',
      name: 'Science Wizard',
      description: 'Complete 20 science quizzes with 80%+ average',
      icon: FaGem,
      category: 'mastery',
      rarity: 'epic',
      condition: (stats) => stats.scienceQuizzes >= 20 && stats.scienceAverage >= 80,
      reward: { xp: 800, coins: 400, gems: 2 }
    }
  };

  const categories = {
    all: 'All Badges',
    learning: 'Learning',
    performance: 'Performance',
    streak: 'Streaks',
    special: 'Special',
    social: 'Social',
    mastery: 'Mastery'
  };

  const rarityColors = {
    common: '#95a5a6',
    uncommon: '#27ae60',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12'
  };

  // Check for newly unlocked badges
  useEffect(() => {
    const newUnlocks = [];
    
    Object.values(badgeDefinitions).forEach(badge => {
      if (badge.condition(userStats) && !unlockedBadges.has(badge.id)) {
        newUnlocks.push(badge);
      }
    });

    if (newUnlocks.length > 0) {
      setUnlockedBadges(prev => {
        const updated = new Set(prev);
        newUnlocks.forEach(badge => updated.add(badge.id));
        return updated;
      });

      if (showUnlockAnimation) {
        setRecentUnlocks(newUnlocks);
        setTimeout(() => setRecentUnlocks([]), 4000);
      }

      // Trigger callback for each unlock
      newUnlocks.forEach(badge => {
        if (onBadgeUnlock) {
          onBadgeUnlock(badge);
        }
      });
    }
  }, [userStats, unlockedBadges, showUnlockAnimation, onBadgeUnlock]);

  // Filter badges by category
  const filteredBadges = Object.values(badgeDefinitions).filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  // Calculate progress for locked badges
  const getBadgeProgress = (badge) => {
    if (unlockedBadges.has(badge.id)) return 100;
    
    // Custom progress calculation based on badge type
    switch (badge.id) {
      case 'quickLearner':
        return Math.min((userStats.quizzesCompleted || 0) / 10 * 100, 100);
      case 'scholar':
        return Math.min((userStats.quizzesCompleted || 0) / 50 * 100, 100);
      case 'perfectionist':
        return Math.min((userStats.perfectScores || 0) / 10 * 100, 100);
      case 'onFire':
        return Math.min((userStats.currentStreak || 0) / 7 * 100, 100);
      case 'unstoppable':
        return Math.min((userStats.currentStreak || 0) / 30 * 100, 100);
      case 'mathMaster':
        return Math.min((userStats.mathQuizzes || 0) / 20 * 100, 100);
      case 'scienceWizard':
        return Math.min((userStats.scienceQuizzes || 0) / 20 * 100, 100);
      default:
        return badge.condition(userStats) ? 100 : 0;
    }
  };

  return (
    <div className="achievement-badges">
      {/* Unlock Animations */}
      <AnimatePresence>
        {recentUnlocks.map((badge, index) => (
          <motion.div
            key={`unlock-${badge.id}`}
            className="badge-unlock-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.5 }}
          >
            <motion.div
              className="unlock-content"
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: index * 0.5 + 0.2
              }}
            >
              <div className="unlock-badge">
                <badge.icon 
                  className="unlock-icon" 
                  style={{ color: rarityColors[badge.rarity] }}
                />
              </div>
              <h2>Badge Unlocked!</h2>
              <h3>{badge.name}</h3>
              <p>{badge.description}</p>
              <div className="unlock-rewards">
                {badge.reward.xp && (
                  <span className="reward-item">
                    <FaStar /> +{badge.reward.xp} XP
                  </span>
                )}
                {badge.reward.coins && (
                  <span className="reward-item">
                    <FaTrophy /> +{badge.reward.coins} Coins
                  </span>
                )}
                {badge.reward.gems && (
                  <span className="reward-item">
                    <FaGem /> +{badge.reward.gems} Gems
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Category Filter */}
      <div className="category-filter">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="badges-grid">
        {filteredBadges.map((badge, index) => {
          const isUnlocked = unlockedBadges.has(badge.id);
          const progress = getBadgeProgress(badge);
          const IconComponent = badge.icon;

          return (
            <motion.div
              key={badge.id}
              className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'} ${badge.rarity}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setShowDetails(badge)}
            >
              <div className="badge-header">
                <div className="badge-rarity" style={{ backgroundColor: rarityColors[badge.rarity] }}>
                  {badge.rarity}
                </div>
                {!isUnlocked && <FaLock className="lock-icon" />}
              </div>

              <div className="badge-icon-container">
                <IconComponent 
                  className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}
                  style={{ color: isUnlocked ? rarityColors[badge.rarity] : '#666' }}
                />
                {isUnlocked && (
                  <div className="unlock-check">
                    <FaCheck />
                  </div>
                )}
              </div>

              <div className="badge-info">
                <h3 className="badge-name">{badge.name}</h3>
                <p className="badge-description">{badge.description}</p>
                
                {!isUnlocked && progress > 0 && (
                  <div className="badge-progress">
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        style={{ backgroundColor: rarityColors[badge.rarity] }}
                      />
                    </div>
                    <span className="progress-text">{Math.round(progress)}%</span>
                  </div>
                )}
              </div>

              <div className="badge-rewards">
                {badge.reward.xp && (
                  <span className="reward-preview">
                    <FaStar /> {badge.reward.xp}
                  </span>
                )}
                {badge.reward.coins && (
                  <span className="reward-preview">
                    <FaTrophy /> {badge.reward.coins}
                  </span>
                )}
                {badge.reward.gems && (
                  <span className="reward-preview">
                    <FaGem /> {badge.reward.gems}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="badge-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(null)}
          >
            <motion.div
              className="badge-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <showDetails.icon 
                  className="modal-icon"
                  style={{ color: rarityColors[showDetails.rarity] }}
                />
                <div>
                  <h2>{showDetails.name}</h2>
                  <div className="modal-rarity" style={{ color: rarityColors[showDetails.rarity] }}>
                    {showDetails.rarity.toUpperCase()}
                  </div>
                </div>
                <button 
                  className="close-btn"
                  onClick={() => setShowDetails(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <p className="modal-description">{showDetails.description}</p>
                
                <div className="modal-rewards">
                  <h4>Rewards:</h4>
                  <div className="rewards-list">
                    {showDetails.reward.xp && (
                      <div className="reward-item">
                        <FaStar /> {showDetails.reward.xp} XP
                      </div>
                    )}
                    {showDetails.reward.coins && (
                      <div className="reward-item">
                        <FaTrophy /> {showDetails.reward.coins} Coins
                      </div>
                    )}
                    {showDetails.reward.gems && (
                      <div className="reward-item">
                        <FaGem /> {showDetails.reward.gems} Gems
                      </div>
                    )}
                  </div>
                </div>
                
                {!unlockedBadges.has(showDetails.id) && (
                  <div className="modal-progress">
                    <h4>Progress:</h4>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${getBadgeProgress(showDetails)}%`,
                          backgroundColor: rarityColors[showDetails.rarity]
                        }}
                      />
                    </div>
                    <span>{Math.round(getBadgeProgress(showDetails))}% Complete</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="badges-summary">
        <div className="summary-stat">
          <FaTrophy className="summary-icon" />
          <div>
            <span className="summary-number">{unlockedBadges.size}</span>
            <span className="summary-label">Badges Earned</span>
          </div>
        </div>
        <div className="summary-stat">
          <FaFlag className="summary-icon" />
          <div>
            <span className="summary-number">{Object.keys(badgeDefinitions).length - unlockedBadges.size}</span>
            <span className="summary-label">To Unlock</span>
          </div>
        </div>
        <div className="summary-stat">
          <FaMedal className="summary-icon" />
          <div>
            <span className="summary-number">
              {Math.round((unlockedBadges.size / Object.keys(badgeDefinitions).length) * 100)}%
            </span>
            <span className="summary-label">Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadges;