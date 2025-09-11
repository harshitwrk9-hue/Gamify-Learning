import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFire,
  FaCalendarCheck,
  FaTrophy,
  FaGem,
  FaCoins,
  FaStar,
  FaLightbulb,
  FaBookOpen,
  FaClock,
  FaBullseye,
  FaRocket,
  FaHeart,
  FaThumbsUp,
  FaCheckCircle,
  FaTimesCircle,
  FaGift,
  FaChevronRight,
  FaCalendarAlt,
  FaHistory
} from 'react-icons/fa';
import './StreakCounter.css';

const StreakCounter = ({ 
  currentStreak = 0, 
  longestStreak = 0, 
  totalDays = 0,
  onStreakUpdate,
  onChallengeComplete,
  onRewardEarned 
}) => {
  const [streakData, setStreakData] = useState({
    current: currentStreak,
    longest: longestStreak,
    total: totalDays,
    lastActivity: new Date().toISOString().split('T')[0],
    streakHistory: []
  });

  const [dailyChallenges, setDailyChallenges] = useState([
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Complete 3 quizzes today',
      icon: FaBookOpen,
      progress: 0,
      target: 3,
      reward: { coins: 50, xp: 100 },
      completed: false,
      difficulty: 'easy'
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Get 100% on any quiz',
      icon: FaStar,
      progress: 0,
      target: 1,
      reward: { coins: 100, xp: 200, badge: 'perfectionist' },
      completed: false,
      difficulty: 'medium'
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: FaRocket,
      progress: 0,
      target: 1,
      reward: { coins: 75, xp: 150 },
      completed: false,
      difficulty: 'hard'
    },
    {
      id: 'learning_streak',
      title: 'Learning Streak',
      description: 'Study for 30 minutes continuously',
      icon: FaClock,
      progress: 0,
      target: 30,
      reward: { coins: 80, xp: 120 },
      completed: false,
      difficulty: 'medium'
    },
    {
      id: 'social_learner',
      title: 'Social Learner',
      description: 'Help 2 friends with questions',
      icon: FaHeart,
      progress: 0,
      target: 2,
      reward: { coins: 60, xp: 100 },
      completed: false,
      difficulty: 'easy'
    }
  ]);

  const [weeklyGoals, setWeeklyGoals] = useState([
    {
      id: 'weekly_quizzes',
      title: 'Weekly Quiz Champion',
      description: 'Complete 15 quizzes this week',
      progress: 0,
      target: 15,
      reward: { coins: 300, xp: 500, badge: 'weekly_champion' },
      completed: false
    },
    {
      id: 'weekly_streak',
      title: 'Consistency Master',
      description: 'Maintain a 7-day streak',
      progress: Math.min(streakData.current, 7),
      target: 7,
      reward: { coins: 250, xp: 400, badge: 'consistent_learner' },
      completed: streakData.current >= 7
    }
  ]);

  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [showChallengeComplete, setShowChallengeComplete] = useState(null);
  const [selectedTab, setSelectedTab] = useState('daily');
  const [streakCalendar, setStreakCalendar] = useState([]);


  useEffect(() => {
    const generateCalendar = () => {
      const calendar = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dateStr = date.toISOString().split('T')[0];
        const hasActivity = Math.random() > 0.3;
        
        calendar.push({
          date: dateStr,
          day: date.getDate(),
          hasActivity,
          isToday: i === 0
        });
      }
      
      return calendar;
    };
    
    setStreakCalendar(generateCalendar());
  }, []);


  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streakData.lastActivity === yesterdayStr || streakData.lastActivity === today) {
      const newStreak = streakData.lastActivity === yesterdayStr ? streakData.current + 1 : streakData.current;
      const newData = {
        ...streakData,
        current: newStreak,
        longest: Math.max(newStreak, streakData.longest),
        total: streakData.total + (streakData.lastActivity !== today ? 1 : 0),
        lastActivity: today
      };
      
      setStreakData(newData);
      setShowStreakAnimation(true);
      
      if (onStreakUpdate) {
        onStreakUpdate(newData);
      }
      
    
      checkStreakMilestones(newStreak);
      
      setTimeout(() => setShowStreakAnimation(false), 2000);
    }
  };


  const checkStreakMilestones = (streak) => {
    const milestones = {
      7: { coins: 100, xp: 200, badge: 'week_warrior' },
      30: { coins: 500, xp: 1000, badge: 'month_master' },
      100: { coins: 2000, xp: 5000, badge: 'century_scholar' }
    };
    
    if (milestones[streak] && onRewardEarned) {
      onRewardEarned(milestones[streak]);
    }
  };


  const updateChallengeProgress = (challengeId, progress) => {
    setDailyChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const newProgress = Math.min(progress, challenge.target);
        const completed = newProgress >= challenge.target;
        
        if (completed && !challenge.completed) {
          setShowChallengeComplete(challenge);
          if (onChallengeComplete) {
            onChallengeComplete(challenge);
          }
          if (onRewardEarned) {
            onRewardEarned(challenge.reward);
          }
          setTimeout(() => setShowChallengeComplete(null), 3000);
        }
        
        return { ...challenge, progress: newProgress, completed };
      }
      return challenge;
    }));
  };


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#667eea';
    }
  };


  const getFlameIntensity = (streak) => {
    if (streak >= 30) return 'legendary';
    if (streak >= 14) return 'epic';
    if (streak >= 7) return 'rare';
    if (streak >= 3) return 'common';
    return 'basic';
  };


  useEffect(() => {
    window.updateStreak = updateStreak;
    window.updateChallengeProgress = updateChallengeProgress;
    
    return () => {
      delete window.updateStreak;
      delete window.updateChallengeProgress;
    };
  }, [streakData]);

  return (
    <div className="streak-counter">

      <AnimatePresence>
        {showStreakAnimation && (
          <motion.div
            className="streak-animation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="streak-celebration"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <FaFire className="celebration-flame" />
              <h2>Streak Extended!</h2>
              <p>{streakData.current} Days Strong! 🔥</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showChallengeComplete && (
          <motion.div
            className="challenge-complete-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="challenge-complete-card"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -50 }}
            >
              <FaCheckCircle className="complete-icon" />
              <h3>Challenge Complete!</h3>
              <p>{showChallengeComplete.title}</p>
              <div className="reward-preview">
                <span><FaCoins /> +{showChallengeComplete.reward.coins}</span>
                <span><FaStar /> +{showChallengeComplete.reward.xp} XP</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="streak-main-display">
        <div className="streak-header">
          <div className="streak-icon-container">
            <motion.div
              className={`streak-flame ${getFlameIntensity(streakData.current)}`}
              animate={{ 
                scale: showStreakAnimation ? [1, 1.2, 1] : 1,
                rotate: showStreakAnimation ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 0.5 }}
            >
              <FaFire className="streak-icon" />
            </motion.div>
          </div>
          
          <div className="streak-info">
            <h2>Current Streak</h2>
            <div className="streak-number">
              <span className="streak-count">{streakData.current}</span>
              <span className="streak-label">Days</span>
            </div>
          </div>
          
          <div className="streak-stats">
            <div className="stat-item">
              <FaTrophy className="stat-icon" />
              <span className="stat-value">{streakData.longest}</span>
              <span className="stat-label">Longest</span>
            </div>
            <div className="stat-item">
              <FaCalendarCheck className="stat-icon" />
              <span className="stat-value">{streakData.total}</span>
              <span className="stat-label">Total Days</span>
            </div>
          </div>
        </div>

  
        <div className="streak-calendar">
          <h4><FaCalendarAlt /> Last 30 Days</h4>
          <div className="calendar-grid">
            {streakCalendar.map((day, index) => (
              <motion.div
                key={day.date}
                className={`calendar-day ${
                  day.hasActivity ? 'active' : 'inactive'
                } ${day.isToday ? 'today' : ''}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                title={day.date}
              >
                {day.day}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="challenge-tabs">
        <button
          className={`tab-btn ${selectedTab === 'daily' ? 'active' : ''}`}
          onClick={() => setSelectedTab('daily')}
        >
          <FaBullseye className="tab-icon" />
          Daily Challenges
        </button>
        <button
          className={`tab-btn ${selectedTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setSelectedTab('weekly')}
        >
          <FaCalendarAlt className="tab-icon" />
          Weekly Goals
        </button>
        <button
          className={`tab-btn ${selectedTab === 'history' ? 'active' : ''}`}
          onClick={() => setSelectedTab('history')}
        >
          <FaHistory className="tab-icon" />
          History
        </button>
      </div>

      
      <div className="challenge-content">
        {selectedTab === 'daily' && (
          <motion.div
            className="daily-challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="challenges-header">
              <h3>Today's Challenges</h3>
              <p>Complete challenges to earn rewards and extend your streak!</p>
            </div>
            
            <div className="challenges-list">
              {dailyChallenges.map((challenge, index) => {
                const IconComponent = challenge.icon;
                const progressPercentage = (challenge.progress / challenge.target) * 100;
                
                return (
                  <motion.div
                    key={challenge.id}
                    className={`challenge-card ${challenge.completed ? 'completed' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="challenge-icon-container">
                      <IconComponent 
                        className="challenge-icon" 
                        style={{ color: getDifficultyColor(challenge.difficulty) }}
                      />
                      {challenge.completed && (
                        <FaCheckCircle className="completion-badge" />
                      )}
                    </div>
                    
                    <div className="challenge-info">
                      <div className="challenge-header">
                        <h4>{challenge.title}</h4>
                        <span 
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}
                        >
                          {challenge.difficulty}
                        </span>
                      </div>
                      <p>{challenge.description}</p>
                      
                      <div className="challenge-progress">
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            style={{ 
                              width: `${progressPercentage}%`,
                              backgroundColor: getDifficultyColor(challenge.difficulty)
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="progress-text">
                          {challenge.progress}/{challenge.target}
                        </span>
                      </div>
                      
                      <div className="challenge-rewards">
                        <span><FaCoins /> {challenge.reward.coins}</span>
                        <span><FaStar /> {challenge.reward.xp} XP</span>
                        {challenge.reward.badge && (
                          <span><FaGem /> Badge</span>
                        )}
                      </div>
                    </div>
                    
                    {challenge.completed && (
                      <motion.div
                        className="completion-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <FaGift className="gift-icon" />
                        <span>Completed!</span>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedTab === 'weekly' && (
          <motion.div
            className="weekly-goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="goals-header">
              <h3>Weekly Goals</h3>
              <p>Long-term challenges for bigger rewards!</p>
            </div>
            
            <div className="goals-list">
              {weeklyGoals.map((goal, index) => {
                const progressPercentage = (goal.progress / goal.target) * 100;
                
                return (
                  <motion.div
                    key={goal.id}
                    className={`goal-card ${goal.completed ? 'completed' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="goal-info">
                      <h4>{goal.title}</h4>
                      <p>{goal.description}</p>
                      
                      <div className="goal-progress">
                        <div className="progress-bar large">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="progress-text">
                          {goal.progress}/{goal.target}
                        </span>
                      </div>
                      
                      <div className="goal-rewards">
                        <span><FaCoins /> {goal.reward.coins}</span>
                        <span><FaStar /> {goal.reward.xp} XP</span>
                        {goal.reward.badge && (
                          <span><FaGem /> {goal.reward.badge}</span>
                        )}
                      </div>
                    </div>
                    
                    {goal.completed && (
                      <div className="completion-badge-large">
                        <FaCheckCircle />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedTab === 'history' && (
          <motion.div
            className="streak-history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="history-header">
              <h3>Streak History</h3>
              <p>Track your learning journey over time</p>
            </div>
            
            <div className="history-stats">
              <div className="history-stat">
                <FaFire className="history-icon" />
                <div>
                  <span className="stat-number">{streakData.longest}</span>
                  <span className="stat-label">Longest Streak</span>
                </div>
              </div>
              <div className="history-stat">
                <FaCalendarCheck className="history-icon" />
                <div>
                  <span className="stat-number">{streakData.total}</span>
                  <span className="stat-label">Total Active Days</span>
                </div>
              </div>
              <div className="history-stat">
                <FaBullseye className="history-icon" />
                <div>
                  <span className="stat-number">{dailyChallenges.filter(c => c.completed).length}</span>
                  <span className="stat-label">Challenges Completed</span>
                </div>
              </div>
            </div>
            
            <div className="achievement-showcase">
              <h4>Recent Achievements</h4>
              <div className="achievements-grid">
                <div className="achievement-item">
                  <FaTrophy className="achievement-icon gold" />
                  <span>Week Warrior</span>
                </div>
                <div className="achievement-item">
                  <FaStar className="achievement-icon silver" />
                  <span>Perfect Score</span>
                </div>
                <div className="achievement-item">
                  <FaRocket className="achievement-icon bronze" />
                  <span>Speed Demon</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StreakCounter;