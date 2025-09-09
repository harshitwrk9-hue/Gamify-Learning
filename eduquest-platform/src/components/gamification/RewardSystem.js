import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, 
  FaGem, 
  FaStar, 
  FaTrophy, 
  FaGift, 
  FaFire, 
  FaBolt, 
  FaHeart,
  FaMagic,
  FaCrown
} from 'react-icons/fa';
import './RewardSystem.css';

const RewardSystem = ({ 
  onRewardEarned,
  showRewards = true,
  coins = 0,
  gems = 0,
  points = 0
}) => {
  const [floatingRewards, setFloatingRewards] = useState([]);
  const [recentRewards, setRecentRewards] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  // Simulate earning rewards (for demo purposes)
  const earnReward = (type, amount, reason) => {
    const rewardId = Date.now() + Math.random();
    const newReward = {
      id: rewardId,
      type,
      amount,
      reason,
      timestamp: Date.now()
    };

    // Add floating animation
    setFloatingRewards(prev => [...prev, newReward]);
    
    // Add to recent rewards
    setRecentRewards(prev => [newReward, ...prev.slice(0, 4)]);
    
    // Show celebration for significant rewards
    if (amount >= 100 || type === 'gem') {
      setCelebrationData(newReward);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Remove floating reward after animation
    setTimeout(() => {
      setFloatingRewards(prev => prev.filter(r => r.id !== rewardId));
    }, 2000);

    // Callback to parent component
    if (onRewardEarned) {
      onRewardEarned(newReward);
    }
  };

  // Demo reward triggers
  const triggerDemoRewards = () => {
    const rewards = [
      { type: 'coin', amount: 50, reason: 'Lesson Completed' },
      { type: 'xp', amount: 100, reason: 'Quiz Perfect Score' },
      { type: 'gem', amount: 1, reason: 'Daily Goal Achieved' },
      { type: 'coin', amount: 25, reason: 'First Try Success' },
      { type: 'xp', amount: 200, reason: 'Streak Milestone' }
    ];
    
    rewards.forEach((reward, index) => {
      setTimeout(() => {
        earnReward(reward.type, reward.amount, reward.reason);
      }, index * 800);
    });
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case 'coin': return <FaCoins />;
      case 'gem': return <FaGem />;
      case 'xp': return <FaStar />;
      case 'trophy': return <FaTrophy />;
      case 'gift': return <FaGift />;
      default: return <FaStar />;
    }
  };

  const getRewardColor = (type) => {
    switch (type) {
      case 'coin': return '#FFD700';
      case 'gem': return '#9C27B0';
      case 'xp': return '#2196F3';
      case 'trophy': return '#FF9800';
      case 'gift': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  return (
    <div className="reward-system">
      {/* Floating Rewards */}
      <AnimatePresence>
        {floatingRewards.map((reward) => (
          <motion.div
            key={reward.id}
            className="floating-reward"
            initial={{ 
              opacity: 0, 
              scale: 0.5, 
              y: 0,
              x: Math.random() * 200 - 100
            }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.2, 1, 0.8], 
              y: -150,
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 2, 
              ease: "easeOut",
              times: [0, 0.2, 0.8, 1]
            }}
            style={{ color: getRewardColor(reward.type) }}
          >
            <div className="reward-icon">
              {getRewardIcon(reward.type)}
            </div>
            <div className="reward-amount">+{reward.amount}</div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <motion.div
            className="celebration-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-content"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="celebration-fireworks">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="firework"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ 
                      scale: [0, 1, 0], 
                      opacity: [1, 1, 0],
                      x: [0, (i % 2 ? 1 : -1) * (50 + i * 20)],
                      y: [0, -30 - i * 10]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.1,
                      repeat: 2
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="celebration-icon"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{ color: getRewardColor(celebrationData.type) }}
              >
                {getRewardIcon(celebrationData.type)}
              </motion.div>
              
              <h3>Amazing Reward!</h3>
              <p className="reward-details">
                +{celebrationData.amount} {celebrationData.type.toUpperCase()}
              </p>
              <p className="reward-reason">{celebrationData.reason}</p>
              
              <motion.div 
                className="celebration-sparkles"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <FaMagic />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Display Panel */}
      {showRewards && (
        <motion.div 
          className="reward-display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="reward-header">
            <FaCrown className="crown-icon" />
            <h3>Your Rewards</h3>
          </div>
          
          <div className="current-rewards">
            <motion.div 
              className="reward-item coins"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCoins className="reward-icon" />
              <div className="reward-info">
                <span className="reward-count">{coins.toLocaleString()}</span>
                <span className="reward-label">Coins</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="reward-item gems"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGem className="reward-icon" />
              <div className="reward-info">
                <span className="reward-count">{gems}</span>
                <span className="reward-label">Gems</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="reward-item points"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaStar className="reward-icon" />
              <div className="reward-info">
                <span className="reward-count">{points.toLocaleString()}</span>
                <span className="reward-label">Points</span>
              </div>
            </motion.div>
          </div>

          {/* Recent Rewards */}
          {recentRewards.length > 0 && (
            <div className="recent-rewards">
              <h4>Recent Rewards</h4>
              <div className="rewards-list">
                {recentRewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    className="recent-reward-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className="recent-reward-icon"
                      style={{ color: getRewardColor(reward.type) }}
                    >
                      {getRewardIcon(reward.type)}
                    </div>
                    <div className="recent-reward-info">
                      <span className="recent-reward-amount">
                        +{reward.amount} {reward.type.toUpperCase()}
                      </span>
                      <span className="recent-reward-reason">{reward.reason}</span>
                    </div>
                    <div className="recent-reward-time">
                      {new Date(reward.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Demo Button */}
          <motion.button
            className="demo-rewards-btn"
            onClick={triggerDemoRewards}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaGift /> Trigger Demo Rewards
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default RewardSystem;