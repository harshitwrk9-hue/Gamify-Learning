import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaTrophy, FaBrain, FaChartLine, FaGamepad } from 'react-icons/fa';
import HeroIllustration from '../assets/hero-illustration.svg';
import LearningProgress from '../assets/learning-progress.svg';

import './LandingPage.css';

const LandingPage = () => {
  const features = [
    {
      icon: FaRocket,
      title: 'Interactive Learning',
      description: 'Engage with dynamic content, quizzes, and hands-on exercises that make learning fun and effective.'
    },
    {
      icon: FaTrophy,
      title: 'Gamified Experience',
      description: 'Earn XP points, unlock badges, and climb leaderboards while mastering new skills.'
    },

    {
      icon: FaBrain,
      title: 'Personalized Path',
      description: 'AI-powered recommendations adapt to your learning style and pace for optimal results.'
    },
    {
      icon: FaChartLine,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and achievement milestones.'
    },
    {
      icon: FaGamepad,
      title: 'Fun Challenges',
      description: 'Complete daily and weekly challenges to stay motivated and earn bonus rewards.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Learners' },
    { number: '500+', label: 'Courses Available' },
    { number: '95%', label: 'Completion Rate' },
    { number: '4.9★', label: 'Average Rating' }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <h1 className="hero-title">
              Transform Your Learning
              <span className="gradient-text"> Journey</span>
            </h1>
            <p className="hero-subtitle">
              Join thousands of learners on Shiksha - the gamified learning platform 
              that makes education engaging, interactive, and rewarding.
            </p>
            
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Learning
                </motion.span>
              </Link>
              <Link to="/courses" className="btn btn-secondary">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Courses
                </motion.span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-image"
          >
            <div className="hero-illustration">
            </div>
            <div className="hero-card">
              <div className="card-header">
                <div className="user-info">
                  <div className="avatar"></div>
                  <div className="user-details">
                    <h1>User</h1>
                    <p>Level 12 • 2,850 XP</p>
                  </div>
                </div>
                <div className="streak">🔥 7 day streak</div>
              </div>
              <div className="progress-section">
                <h5>Current Progress</h5>
                <div className="progress-item">
                  <span>React Mastery</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <span>JavaScript Advanced</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
              <div className="badges-section">
                <h5>Recent Badges</h5>
                <div className="badges">
                  <span className="badge">🏆</span>
                  <span className="badge">⚡</span>
                  <span className="badge">🎯</span>
                  <span className="badge">🧠</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="stat-item"
              >
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="section-header"
          >
            <h2 className="section-title">Why Choose Shiksha?</h2>
            <p className="section-subtitle">
              Discover the features that make learning engaging and effective
            </p>
            <div className="section-illustration">
              <img src={LearningProgress} alt="Learning Progress" className="progress-svg" />
            </div>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="feature-card"
                >
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="cta-content"
          >
            <div className="cta-illustration">
              <img src={LearningProgress} alt="Learning Progress" className="progress-svg" />
            </div>
            <h2 className="cta-title">Ready to Start Your Learning Adventure?</h2>
            <p className="cta-subtitle">
              Join thousands of learners who are already transforming their skills with Shiksha
            </p>
            <Link to="/dashboard" className="btn btn-cta">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;