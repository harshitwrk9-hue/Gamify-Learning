import React from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaTrophy, FaStar, FaBook, FaChartLine, FaArrowRight, FaClock } from 'react-icons/fa';
import BeginnerBadge from '../assets/badge-beginner.svg';
import IntermediateBadge from '../assets/badge-intermediate.svg';
import AdvancedBadge from '../assets/badge-advanced.svg';

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
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="welcome-text">
            <h1>Welcome back, {currentUser.name}! 👋</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <div className="streak-counter">
            <FaFire className="streak-icon" />
            <div className="streak-info">
              <span className="streak-number">{currentUser.streak}</span>
              <span className="streak-label">Day Streak</span>
            </div>
          </div>
        </div>



        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card level-card">
            <div className="stat-icon level-icon">
              <FaStar />
              <div className="level-badge">{currentUser.level}</div>
            </div>
            <div className="stat-content">
              <h3>Level {currentUser.level}</h3>
              <div className="level-title">{currentUser.currentTitle}</div>
              <div className="xp-progress">
                <div className="xp-bar">
                  <div
                    className="xp-fill"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="xp-text">
                  {currentUser.xp} / {currentUser.xpToNextLevel} XP
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card courses-card">
            <div className="stat-icon">
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>{currentUser.completedCourses.length}</h3>
              <p>Courses Completed</p>
              <span className="stat-detail">{currentUser.currentCourses.length} in progress</span>
            </div>
          </div>

          <div className="stat-card badges-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>{userBadges.length}</h3>
              <p>Badges Earned</p>
              <span className="stat-detail">{badges.length - userBadges.length} remaining</span>
            </div>
          </div>

          <div className="stat-card weekly-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>{currentUser.weeklyProgress}/{currentUser.weeklyGoal}</h3>
              <p>Weekly Goal</p>
              <div className="weekly-progress">
                <div
                  className="weekly-bar"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content">
          {/* Current Courses */}
          <div className="content-section current-courses">
            <div className="section-header">
              <h2>Continue Learning</h2>
              <Link to="/courses" className="view-all-link">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="courses-list">
              {currentCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="course-card"
                >
                  <div className="course-thumbnail" style={{ background: course.color }}>
                    <span className="course-category">{course.category}</span>
                  </div>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress}%`, background: course.color }}
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
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Recent Achievements */}
            <div className="content-section recent-achievements">
              <div className="section-header">
                <h3>Recent Achievements</h3>
              </div>
              <div className="achievements-list">
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;