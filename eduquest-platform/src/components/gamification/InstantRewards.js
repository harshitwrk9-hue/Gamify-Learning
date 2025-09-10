import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, 
  FaCoins, 
  FaTrophy, 
  FaBolt, 
  FaFire, 
  FaGem,
  FaCheckCircle,
  FaArrowUp
} from 'react-icons/fa';
import './InstantRewards.css';

const InstantRewards = ({ 
  onRewardEarned,
  currentXP = 0,
  currentCoins = 0,
  currentLevel = 1
}) => {
  const [activeRewards, setActiveRewards] = useState([]);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboCount, setComboCount] = useState(0);

  // XP thresholds for levels
  const getXPForLevel = (level) => level * 100;
  const getCurrentLevelProgress = () => {
    const currentLevelXP = getXPForLevel(currentLevel - 1);
    const nextLevelXP = getXPForLevel(currentLevel);
    return ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  // Reward types and their animations
  const rewardTypes = {
    xp: { icon: FaStar, color: '#FFD700', label: 'XP' },
    coins: { icon: FaCoins, color: '#FFA500', label: 'Coins' },
    streak: { icon: FaFire, color: '#FF4500', label: 'Streak' },
    achievement: { icon: FaTrophy, color: '#C0392B', label: 'Achievement' },
    powerup: { icon: FaBolt, color: '#9B59B6', label: 'Power-up' },
    gem: { icon: FaGem, color: '#3498DB', label: 'Gem' }
  };

  // Add reward to animation queue
  const addReward = (type, amount, message = '') => {
    const id = Date.now() + Math.random();
    const reward = {
      id,
      type,
      amount,
      message,
      multiplier: comboMultiplier
    };

    setActiveRewards(prev => [...prev, reward]);
    
    // Update combo system
    setComboCount(prev => prev + 1);
    if (comboCount >= 2) {
      setComboMultiplier(prev => Math.min(prev + 0.5, 3));
    }

    // Remove reward after animation
    setTimeout(() => {
      setActiveRewards(prev => prev.filter(r => r.id !== id));
    }, 2000);

    // Reset combo after inactivity
    setTimeout(() => {
      setComboCount(0);
      setComboMultiplier(1);
    }, 5000);

    // Trigger callback
    if (onRewardEarned) {
      onRewardEarned({
        type,
        amount: amount * comboMultiplier,
        message
      });
    }
  };

  // Quick reward functions for common actions
  const rewardCorrectAnswer = (difficulty = 'medium') => {
    const baseXP = { easy: 10, medium: 15, hard: 25 }[difficulty] || 15;
    const baseCoins = { easy: 5, medium: 8, hard: 12 }[difficulty] || 8;
    
    addReward('xp', baseXP, 'Correct Answer!');
    setTimeout(() => addReward('coins', baseCoins), 300);
  };

  const rewardQuizCompletion = (score) => {
    const xpReward = Math.round(score * 2);
    const coinReward = Math.round(score * 1.5);
    
    addReward('xp', xpReward, 'Quiz Complete!');
    setTimeout(() => addReward('coins', coinReward), 400);
    
    if (score >= 90) {
      setTimeout(() => addReward('achievement', 1, 'Perfect Score!'), 800);
    }
  };

  const rewardStreak = (streakDays) => {
    const xpBonus = streakDays * 5;
    addReward('streak', streakDays, `${streakDays} Day Streak!`);
    setTimeout(() => addReward('xp', xpBonus, 'Streak Bonus!'), 500);
  };

  const rewardLevelUp = (newLevel) => {
    setLevelUpAnimation(true);
    addReward('achievement', 1, `Level ${newLevel}!`);
    setTimeout(() => addReward('gem', 1, 'Level Up Reward!'), 600);
    setTimeout(() => setLevelUpAnimation(false), 3000);
  };

  // Expose reward functions globally
  useEffect(() => {
    window.eduquestRewards = {
      correctAnswer: rewardCorrectAnswer,
      quizComplete: rewardQuizCompletion,
      streak: rewardStreak,
      levelUp: rewardLevelUp,
      custom: addReward
    };

    return () => {
      delete window.eduquestRewards;
    };
  }, [comboMultiplier, comboCount]);

  return (
    <div className="instant-rewards-container">
      {/* Level Up Animation */}
      <AnimatePresence>
        {levelUpAnimation && (
          <motion.div
            className="level-up-overlay"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="level-up-content"
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: 1 }}
            >
              <FaTrophy className="level-up-icon" />
              <h2>LEVEL UP!</h2>
              <p>Level {currentLevel}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Multiplier Display */}
      <AnimatePresence>
        {comboMultiplier > 1 && (
          <motion.div
            className="combo-display"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FaBolt className="combo-icon" />
            <span>x{comboMultiplier.toFixed(1)} COMBO!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Rewards */}
      <div className="rewards-container">
        <AnimatePresence>
          {activeRewards.map((reward) => {
            const RewardIcon = rewardTypes[reward.type]?.icon || FaStar;
            const color = rewardTypes[reward.type]?.color || '#FFD700';
            
            return (
              <motion.div
                key={reward.id}
                className="floating-reward"
                initial={{ 
                  opacity: 0, 
                  scale: 0.5, 
                  y: 0,
                  x: Math.random() * 100 - 50
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.5, 1.2, 1, 0.8],
                  y: -100,
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  ease: "easeOut"
                }}
                style={{ color }}
              >
                <div className="reward-content">
                  <RewardIcon className="reward-icon" />
                  <div className="reward-text">
                    <span className="reward-amount">
                      +{Math.round(reward.amount * reward.multiplier)}
                    </span>
                    {reward.message && (
                      <span className="reward-message">{reward.message}</span>
                    )}
                    {reward.multiplier > 1 && (
                      <span className="reward-multiplier">x{reward.multiplier}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* XP Progress Bar (Mini) */}
      <div className="mini-xp-bar">
        <div className="xp-info">
          <span>Level {currentLevel}</span>
          <span>{currentXP} XP</span>
        </div>
        <div className="xp-progress">
          <motion.div 
            className="xp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${getCurrentLevelProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default InstantRewards;