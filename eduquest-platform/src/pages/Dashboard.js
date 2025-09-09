import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFire, FaTrophy, FaStar, FaBook, FaChartLine, FaBullseye, FaClock, FaArrowRight, FaGamepad } from 'react-icons/fa';
import BeginnerBadge from '../assets/badge-beginner.svg';
import IntermediateBadge from '../assets/badge-intermediate.svg';
import AdvancedBadge from '../assets/badge-advanced.svg';
import ProgressChart from '../assets/progress-chart.svg';
import AnimatedCounter from '../components/AnimatedCounter';
import ParticleSystem from '../components/ParticleSystem';
import FloatingElements from '../components/FloatingElements';
import GamificationPanel from '../components/gamification/GamificationPanel';
import ProgressTracker from '../components/gamification/ProgressTracker';
import RewardSystem from '../components/gamification/RewardSystem';
import Leaderboard from '../components/gamification/Leaderboard';
import { currentUser, courses, badges, achievements, challenges } from '../data/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const userBadges = badges.filter(badge => currentUser.badges.includes(badge.id));
  const currentCourses = courses.filter(course => currentUser.currentCourses.includes(course.id));
  const recentAchievements = achievements.slice(-3);
  const activeChallenges = challenges.filter(challenge => !challenge.completed);

  const xpProgress = (currentUser.xp / currentUser.xpToNextLevel) * 100;
  const weeklyProgress = (currentUser.weeklyProgress / currentUser.weeklyGoal) * 100;

  // Helper function to get badge SVG based on badge name or type
  const getBadgeSVG = (badgeName) => {
    if (badgeName.toLowerCase().includes('beginner') || badgeName.toLowerCase().includes('first')) {
      return BeginnerBadge;
    } else if (badgeName.toLowerCase().includes('intermediate') || badgeName.toLowerCase().includes('streak')) {
      return IntermediateBadge;
    } else if (badgeName.toLowerCase().includes('advanced') || badgeName.toLowerCase().includes('master')) {
      return AdvancedBadge;
    }
    return BeginnerBadge; // Default fallback
  };

  return (
    <div className="dashboard particle-container">
      <ParticleSystem 
        particleCount={40}
        speed={0.5}
        interactive={true}
        className="dashboard-particles"
      />
      <FloatingElements 
        elementCount={15}
        className="dashboard-floating"
      />
      <div className="particle-overlay" />
      <div className="dashboard-container">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="welcome-header animate-fade-in-up"
        >
          <div className="welcome-text">
            <h1>Welcome back, {currentUser.name}! 👋</h1>
            <p>Ready to level up your learning adventure?</p>
            <div className="gamification-hint">
              <FaGamepad className="game-icon" />
              <span>Complete daily quests to earn coins and unlock power-ups!</span>
            </div>
          </div>
          <div className="streak-counter">
            <FaFire className="streak-icon" />
            <div className="streak-info">
              <span className="streak-number"><AnimatedCounter value={currentUser.streak} duration={1200} /></span>
              <span className="streak-label">Day Streak</span>
            </div>
          </div>
        </motion.div>

        {/* Gamification Panel */}
      <GamificationPanel />
      
      {/* Progress Tracker */}
      <ProgressTracker 
        currentStreak={currentUser.streak}
        longestStreak={currentUser.longestStreak || 15}
        weeklyGoal={5}
        weeklyProgress={weeklyProgress}
        dailyGoal={2}
        dailyProgress={1}
        monthlyGoal={20}
        monthlyProgress={12}
        recentAchievements={[
          {
            name: "First Steps",
            date: "Today",
            xp: 50,
            icon: "🎯"
          },
          {
            name: "Quick Learner",
            date: "Yesterday",
            xp: 100,
            icon: "⚡"
          },
          {
            name: "Streak Master",
            date: "2 days ago",
            xp: 200,
            icon: "🔥"
          }
        ]}
      />
      
      {/* Reward System */}
      <RewardSystem 
        coins={currentUser.coins || 1250}
        gems={currentUser.gems || 15}
        points={currentUser.xp}
        onRewardEarned={(reward) => {
          console.log('Reward earned:', reward);
          // Handle reward logic here
        }}
      />
      
      {/* Leaderboard */}
      <Leaderboard 
        currentUserId="user1"
        timeframe="weekly"
      />

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="stat-card level-card animate-fade-in-scale border-glow"
          >
            <div className="stat-icon level-icon">
              <FaStar />
              <div className="level-badge">{currentUser.level}</div>
            </div>
            <div className="stat-content">
              <h3>Level <AnimatedCounter value={currentUser.level} duration={1500} /></h3>
              <div className="level-title">{currentUser.currentTitle}</div>
              <div className="xp-progress">
                <div className="xp-bar">
                  <motion.div
                    className="xp-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <div className="xp-sparkles">✨</div>
                </div>
                <span className="xp-text">
                  <AnimatedCounter value={currentUser.xp} duration={2500} /> / <AnimatedCounter value={currentUser.xpToNextLevel} duration={2800} /> XP
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="stat-card courses-card animate-fade-in-scale border-glow"
          >
            <div className="stat-icon animate-pulse">
              <FaBook />
            </div>
            <div className="stat-content">
              <h3><AnimatedCounter value={currentUser.completedCourses.length} duration={2000} /></h3>
              <p>Courses Completed</p>
              <span className="stat-detail"><AnimatedCounter value={currentUser.currentCourses.length} duration={1800} /> in progress</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="stat-card badges-card animate-fade-in-scale border-glow"
          >
            <div className="stat-icon animate-bounce">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3><AnimatedCounter value={userBadges.length} duration={2200} /></h3>
              <p>Badges Earned</p>
              <span className="stat-detail"><AnimatedCounter value={badges.length - userBadges.length} duration={2000} /> remaining</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="stat-card weekly-card animate-fade-in-scale border-glow"
          >
            <div className="stat-icon animate-glow">
              <FaBullseye />
            </div>
            <div className="stat-content">
              <h3><AnimatedCounter value={currentUser.weeklyProgress} duration={1800} />/<AnimatedCounter value={currentUser.weeklyGoal} duration={2000} /></h3>
              <p>Weekly Goal</p>
              <div className="weekly-progress">
                <motion.div
                  className="weekly-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </div>
              <div className="progress-chart-container">
                <img src={ProgressChart} alt="Progress Chart" className="progress-chart" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content">
          {/* Current Courses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="content-section current-courses animate-slide-in-left glass-card"
          >
            <div className="section-header">
              <h2>Continue Learning</h2>
              <Link to="/courses" className="view-all-link">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="courses-list">
              {currentCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="course-card animate-fade-in-scale border-glow"
                >
                  <div className="course-thumbnail" style={{ background: course.color }}>
                    <span className="course-category">{course.category}</span>
                  </div>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-progress">
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                          style={{ background: course.color }}
                        />
                      </div>
                      <span className="progress-text">{course.progress}% complete</span>
                    </div>
                    <div className="course-meta">
                      <span><FaClock /> {course.completedLessons}/{course.lessons} lessons</span>
                      <Link to={`/course/${course.id}`} className="continue-btn">
                        Continue
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Recent Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="content-section recent-badges animate-slide-in-right glass-card"
            >
              <div className="section-header">
                <h3>Recent Badges</h3>
                <Link to="/profile" className="view-all-link">
                  View All <FaArrowRight />
                </Link>
              </div>
              <div className="badges-grid">
                {userBadges.slice(-6).map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="badge-item animate-bounce border-glow"
                    title={badge.description}
                    style={{ '--badge-index': index }}
                  >
                    <div className="badge-svg-container">
                      <img src={getBadgeSVG(badge.name)} alt={badge.name} className="badge-svg" />
                    </div>
                    <span className="badge-name">{badge.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Active Challenges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="content-section active-challenges animate-slide-in-right glass-card"
            >
              <div className="section-header">
                <h3>Active Challenges</h3>
              </div>
              <div className="challenges-list">
                {activeChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    className="challenge-item animate-fade-in-up border-glow"
                  >
                    <div className="challenge-info">
                      <h4>{challenge.title}</h4>
                      <p>{challenge.description}</p>
                      <div className="challenge-progress">
                        <div className="challenge-bar">
                          <motion.div
                            className="challenge-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                            transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                          />
                        </div>
                        <span>{challenge.progress}/{challenge.target}</span>
                      </div>
                    </div>
                    <div className="challenge-reward">
                      <span className="reward-xp">+{challenge.xpReward} XP</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="content-section recent-achievements"
            >
              <div className="section-header">
                <h3>Recent Achievements</h3>
              </div>
              <div className="achievements-list">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                    className="achievement-item"
                  >
                    <div className="achievement-icon">
                      <FaChartLine />
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      <span className="achievement-xp">+{achievement.xpEarned} XP</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;