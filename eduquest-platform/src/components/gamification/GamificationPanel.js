import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, 
  FaGem, 
  FaBolt, 
  FaShieldAlt, 
  FaClock, 
  FaLightbulb,
  FaTrophy,
  FaFire,
  FaStar,
  FaGift
} from 'react-icons/fa';
import { currentUser, dailyQuests, powerUps, achievementTiers } from '../../data/mockData';
import AnimatedCounter from '../AnimatedCounter';
import './GamificationPanel.css';

const GamificationPanel = () => {
  const [activeTab, setActiveTab] = useState('quests');
  const [showPowerUpShop, setShowPowerUpShop] = useState(false);

  const getPowerUpIcon = (iconName) => {
    const icons = {
      '⚡': FaBolt,
      '🛡️': FaShieldAlt,
      '⏰': FaClock,
      '💡': FaLightbulb
    };
    return icons[iconName] || FaBolt;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10B981',
      medium: '#F59E0B',
      hard: '#EF4444',
      legendary: '#8B5CF6'
    };
    return colors[difficulty] || '#6B7280';
  };

  const completedQuests = dailyQuests.filter(quest => quest.completed).length;
  const totalQuests = dailyQuests.length;
  const questProgress = (completedQuests / totalQuests) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="gamification-panel"
    >
      {/* Currency Display */}
      <div className="currency-display">
        <motion.div 
          className="currency-item coins"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaCoins className="currency-icon" />
          <div className="currency-info">
            <span className="currency-amount">
              <AnimatedCounter value={currentUser.coins} duration={1500} />
            </span>
            <span className="currency-label">Coins</span>
          </div>
        </motion.div>

        <motion.div 
          className="currency-item gems"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaGem className="currency-icon" />
          <div className="currency-info">
            <span className="currency-amount">
              <AnimatedCounter value={currentUser.gems} duration={1500} />
            </span>
            <span className="currency-label">Gems</span>
          </div>
        </motion.div>

        <motion.div 
          className="title-display"
          whileHover={{ scale: 1.02 }}
        >
          <FaTrophy className="title-icon" />
          <div className="title-info">
            <span className="current-title">{currentUser.currentTitle}</span>
            <span className="title-label">Current Title</span>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'quests' ? 'active' : ''}`}
          onClick={() => setActiveTab('quests')}
        >
          <FaFire /> Daily Quests
        </button>
        <button 
          className={`tab-button ${activeTab === 'powerups' ? 'active' : ''}`}
          onClick={() => setActiveTab('powerups')}
        >
          <FaBolt /> Power-ups
        </button>
        <button 
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <FaTrophy /> Achievements
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'quests' && (
          <motion.div
            key="quests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="tab-content"
          >
            <div className="quest-progress-header">
              <h3>Daily Progress</h3>
              <div className="quest-progress-bar">
                <motion.div 
                  className="quest-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${questProgress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <span className="quest-progress-text">{completedQuests}/{totalQuests} completed</span>
            </div>

            <div className="quests-list">
              {dailyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`quest-item ${quest.completed ? 'completed' : ''}`}
                >
                  <div className="quest-icon">{quest.icon}</div>
                  <div className="quest-info">
                    <h4>{quest.title}</h4>
                    <p>{quest.description}</p>
                    <div className="quest-progress">
                      <div className="quest-bar">
                        <motion.div 
                          className="quest-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                      <span>{quest.progress}/{quest.target}</span>
                    </div>
                  </div>
                  <div className="quest-rewards">
                    <div className="reward-item">
                      <FaStar className="xp-icon" />
                      <span>+{quest.xpReward}</span>
                    </div>
                    <div className="reward-item">
                      <FaCoins className="coin-icon" />
                      <span>+{quest.coinReward}</span>
                    </div>
                    {quest.completed && (
                      <motion.div 
                        className="completion-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'powerups' && (
          <motion.div
            key="powerups"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="tab-content"
          >
            <div className="powerups-header">
              <h3>Your Power-ups</h3>
              <button 
                className="shop-button"
                onClick={() => setShowPowerUpShop(!showPowerUpShop)}
              >
                <FaGift /> Shop
              </button>
            </div>

            <div className="owned-powerups">
              {Object.entries(currentUser.powerUps).map(([key, count], index) => {
                const powerUp = powerUps.find(p => p.name.toLowerCase().replace(/[^a-z]/g, '') === key);
                if (!powerUp || count === 0) return null;
                
                const IconComponent = getPowerUpIcon(powerUp.icon);
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="powerup-owned"
                  >
                    <IconComponent className="powerup-icon" />
                    <div className="powerup-info">
                      <h4>{powerUp.name}</h4>
                      <p>{powerUp.description}</p>
                    </div>
                    <div className="powerup-count">{count}</div>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {showPowerUpShop && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="powerup-shop"
                >
                  <h4>Power-up Shop</h4>
                  <div className="shop-items">
                    {powerUps.map((powerUp, index) => {
                      const IconComponent = getPowerUpIcon(powerUp.icon);
                      const canAfford = currentUser.coins >= powerUp.cost;
                      
                      return (
                        <motion.div
                          key={powerUp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`shop-item ${!canAfford ? 'disabled' : ''}`}
                        >
                          <IconComponent className="shop-icon" />
                          <div className="shop-info">
                            <h5>{powerUp.name}</h5>
                            <p>{powerUp.description}</p>
                            <div className="shop-cost">
                              <FaCoins /> {powerUp.cost}
                            </div>
                          </div>
                          <button 
                            className="buy-button"
                            disabled={!canAfford}
                          >
                            Buy
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="tab-content"
          >
            <div className="achievements-header">
              <h3>Recent Achievements</h3>
              <div className="achievement-stats">
                <span>{currentUser.achievements.totalEarned} Total Earned</span>
              </div>
            </div>

            <div className="recent-achievements">
              {currentUser.achievements.recentlyUnlocked.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="achievement-unlock"
                >
                  <div className="achievement-glow" />
                  <FaTrophy className="achievement-trophy" />
                  <div className="achievement-text">
                    <h4>Achievement Unlocked!</h4>
                    <p>{achievement}</p>
                  </div>
                  <motion.div 
                    className="achievement-sparkles"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    ✨
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <div className="achievement-tiers">
              <h4>Achievement Tiers</h4>
              <div className="tiers-grid">
                {Object.entries(achievementTiers).map(([tier, data], index) => (
                  <motion.div
                    key={tier}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="tier-item"
                    style={{ '--tier-color': data.color }}
                  >
                    <span className="tier-icon">{data.icon}</span>
                    <div className="tier-info">
                      <h5>{tier.charAt(0).toUpperCase() + tier.slice(1)}</h5>
                      <p>{data.multiplier}x XP Multiplier</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GamificationPanel;