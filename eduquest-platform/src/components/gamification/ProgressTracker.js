import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFire, 
  FaTrophy, 
  FaBullseye, 
  FaStar, 
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaBolt
} from 'react-icons/fa';
import './ProgressTracker.css';

const ProgressTracker = ({ 
  currentStreak = 7, 
  longestStreak = 15, 
  weeklyGoal = 5, 
  weeklyProgress = 3,
  dailyGoal = 2,
  dailyProgress = 1,
  monthlyGoal = 20,
  monthlyProgress = 12,
  recentAchievements = []
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animateStreak, setAnimateStreak] = useState(false);

  const weeklyPercentage = Math.min((weeklyProgress / weeklyGoal) * 100, 100);
  const dailyPercentage = Math.min((dailyProgress / dailyGoal) * 100, 100);
  const monthlyPercentage = Math.min((monthlyProgress / monthlyGoal) * 100, 100);

  useEffect(() => {
    if (dailyPercentage === 100) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [dailyPercentage]);

  useEffect(() => {
    if (currentStreak > 0) {
      setAnimateStreak(true);
      setTimeout(() => setAnimateStreak(false), 1000);
    }
  }, [currentStreak]);

  const getStreakColor = (streak) => {
    if (streak >= 30) return '#FF6B35'; // Fire red
    if (streak >= 14) return '#FF8E53'; // Orange
    if (streak >= 7) return '#FFA726'; // Light orange
    return '#FFB74D'; // Yellow
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#4CAF50'; // Green
    if (percentage >= 75) return '#8BC34A'; // Light green
    if (percentage >= 50) return '#FFC107'; // Yellow
    return '#FF9800'; // Orange
  };

  return (
    <div className="progress-tracker">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="celebration-overlay"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <div className="celebration-content">
              <FaTrophy className="celebration-icon" />
              <h3>Daily Goal Complete!</h3>
              <p>Amazing work! Keep the streak going! 🎉</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Counter */}
      <motion.div 
        className="streak-section"
        animate={animateStreak ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="streak-header">
          <FaFire 
            className="streak-icon" 
            style={{ color: getStreakColor(currentStreak) }}
          />
          <div className="streak-info">
            <h3>Current Streak</h3>
            <div className="streak-numbers">
              <span className="current-streak">{currentStreak}</span>
              <span className="streak-label">days</span>
            </div>
          </div>
        </div>
        <div className="streak-comparison">
          <span>Personal Best: {longestStreak} days</span>
          {currentStreak === longestStreak && (
            <motion.span 
              className="new-record"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🏆 New Record!
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Progress Goals */}
      <div className="progress-goals">
        {/* Daily Progress */}
        <motion.div 
          className="progress-card daily"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="progress-header">
            <FaClock className="progress-icon" />
            <div>
              <h4>Daily Goal</h4>
              <span>{dailyProgress}/{dailyGoal} lessons</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${dailyPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ backgroundColor: getProgressColor(dailyPercentage) }}
            />
            <span className="progress-percentage">{Math.round(dailyPercentage)}%</span>
          </div>
          {dailyPercentage === 100 && (
            <motion.div 
              className="completion-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
            >
              <FaCheckCircle /> Complete!
            </motion.div>
          )}
        </motion.div>

        {/* Weekly Progress */}
        <motion.div 
          className="progress-card weekly"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="progress-header">
            <FaCalendarAlt className="progress-icon" />
            <div>
              <h4>Weekly Goal</h4>
              <span>{weeklyProgress}/{weeklyGoal} lessons</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${weeklyPercentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ backgroundColor: getProgressColor(weeklyPercentage) }}
            />
            <span className="progress-percentage">{Math.round(weeklyPercentage)}%</span>
          </div>
          {weeklyPercentage === 100 && (
            <motion.div 
              className="completion-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.7 }}
            >
              <FaStar /> Excellent!
            </motion.div>
          )}
        </motion.div>

        {/* Monthly Progress */}
        <motion.div 
          className="progress-card monthly"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="progress-header">
            <FaBullseye className="progress-icon" />
            <div>
              <h4>Monthly Goal</h4>
              <span>{monthlyProgress}/{monthlyGoal} lessons</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${monthlyPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ backgroundColor: getProgressColor(monthlyPercentage) }}
            />
            <span className="progress-percentage">{Math.round(monthlyPercentage)}%</span>
          </div>
          {monthlyPercentage === 100 && (
            <motion.div 
              className="completion-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.9 }}
            >
              <FaBolt /> Champion!
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="recent-achievements">
          <h4>Recent Achievements</h4>
          <div className="achievements-list">
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                className="achievement-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="achievement-icon">
                  {achievement.icon || <FaTrophy />}
                </div>
                <div className="achievement-info">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-date">{achievement.date}</span>
                </div>
                <div className="achievement-xp">+{achievement.xp} XP</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;