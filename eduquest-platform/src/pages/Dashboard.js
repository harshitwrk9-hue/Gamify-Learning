import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaTrophy, FaStar, FaBook, FaArrowRight, FaClock, FaBolt, FaGem, FaCheckCircle, FaPlay } from 'react-icons/fa';


import { currentUser, courses, badges } from '../data/mockData';
import './Dashboard.css';

const DailyChallenges = () => {
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: "Complete 3 Lessons",
      description: "Finish any 3 lessons today",
      progress: 2,
      target: 3,
      reward: { xp: 150, coins: 75 },
      icon: FaBook,
      type: "daily",
      completed: false
    },
    {
      id: 2,
      title: "Perfect Quiz Score",
      description: "Get 100% on any quiz",
      progress: 0,
      target: 1,
      reward: { xp: 200, gems: 2 },
      icon: FaTrophy,
      type: "daily",
      completed: false
    },
    {
      id: 3,
      title: "Study Streak",
      description: "Maintain your learning streak",
      progress: 1,
      target: 1,
      reward: { xp: 100, coins: 50 },
      icon: FaFire,
      type: "daily",
      completed: true
    }
  ]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const completeChallenge = (challengeId) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, progress: challenge.target }
        : challenge
    ));
  };

  const getProgressPercentage = (progress, target) => {
    return Math.min((progress / target) * 100, 100);
  };

  return (
    <div className="content-section daily-challenges">
      <div className="section-header">
        <h3>Daily Challenges</h3>
        <div className="challenge-timer">
          <FaClock className="timer-icon" />
          <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>
      
      <div className="challenges-list">
        {challenges.map((challenge) => {
          const IconComponent = challenge.icon;
          const progressPercentage = getProgressPercentage(challenge.progress, challenge.target);
          
          return (
            <div
              key={challenge.id}
              className={`challenge-item ${challenge.completed ? 'completed' : ''}`}
            >
              <div className="challenge-icon">
                <IconComponent />
                {challenge.completed && (
                  <div className="completion-badge">
                    <FaCheckCircle />
                  </div>
                )}
              </div>
              
              <div className="challenge-content">
                <div className="challenge-header">
                  <h4>{challenge.title}</h4>
                  <div className="challenge-progress-text">
                    {challenge.progress}/{challenge.target}
                  </div>
                </div>
                
                <p className="challenge-description">{challenge.description}</p>
                
                <div className="challenge-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                <div className="challenge-rewards">
                  {challenge.reward.xp && (
                    <span className="reward-item xp">
                      <FaStar /> +{challenge.reward.xp} XP
                    </span>
                  )}
                  {challenge.reward.coins && (
                    <span className="reward-item coins">
                      <FaBolt /> +{challenge.reward.coins}
                    </span>
                  )}
                  {challenge.reward.gems && (
                    <span className="reward-item gems">
                      <FaGem /> +{challenge.reward.gems}
                    </span>
                  )}
                </div>
              </div>
              
              {!challenge.completed && challenge.progress < challenge.target && (
                <button 
                  className="challenge-action-btn"
                  onClick={() => completeChallenge(challenge.id)}
                >
                  <FaPlay />
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="challenges-summary">
        <div className="summary-stat">
          <span className="stat-number">{challenges.filter(c => c.completed).length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{challenges.length - challenges.filter(c => c.completed).length}</span>
          <span className="stat-label">Remaining</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">
            {challenges.reduce((total, c) => total + (c.completed ? c.reward.xp || 0 : 0), 0)}
          </span>
          <span className="stat-label">XP Earned</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const userBadges = badges.filter(badge => currentUser.badges.includes(badge.id));
  const currentCourses = courses.filter(course => currentUser.currentCourses.includes(course.id));


  const xpProgress = (currentUser.xp / currentUser.xpToNextLevel) * 100;
  const weeklyProgress = (currentUser.weeklyProgress / currentUser.weeklyGoal) * 100;



  return (
    <div className="dashboard">
      <div className="dashboard-container">
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

        <div className="stats-grid">
          <div className="stat-card level-card">
            <div className="stat-icon level-icon">
              <FaStar />

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

        <div className="main-content">
          <div className="content-section current-courses">
            <div className="section-header">
              <h2>Continue Learning</h2>
              <Link to="/courses" className="view-all-link">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="courses-list">
              {currentCourses.map((course, index) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="course-card-link"
                >
                  <div className="course-card">
                  <div className="course-thumbnail">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <div className="course-category-overlay">
                      <span className="course-category">{course.category}</span>
                    </div>
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
                      <div className="continue-btn" onClick={(e) => e.preventDefault()}>
                        Continue
                      </div>
                    </div>
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar">
            <DailyChallenges />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;