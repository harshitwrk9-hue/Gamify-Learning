import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaTrophy, FaBrain, FaChartLine, FaGamepad, FaUser } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

import LearningProgress from '../assets/learning-progress.svg';

import './LandingPage.css';

const LandingPage = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: FaRocket,
      title: t('home.features.interactive.title'),
      description: t('home.features.interactive.description')
    },
    {
      icon: FaTrophy,
      title: t('home.features.gamification.title'),
      description: t('home.features.gamification.description')
    },
    {
      icon: FaBrain,
      title: t('home.features.personalized.title'),
      description: t('home.features.personalized.description')
    },
    {
      icon: FaChartLine,
      title: t('home.features.progress.title'),
      description: t('home.features.progress.description')
    },
    {
      icon: FaGamepad,
      title: t('home.features.challenges.title'),
      description: t('home.features.challenges.description')
    }
  ];

  const stats = [
    { number: '10K+', label: t('home.stats.activeLearners') },
    { number: '500+', label: t('home.stats.coursesAvailable') },
    { number: '95%', label: t('home.stats.completionRate') },
    { number: '4.9★', label: t('home.stats.averageRating') }
  ];

  return (
    <div className="landing-page">

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
              {t('home.title')}
              <span className="gradient-text"> {t('home.titleHighlight')}</span>
            </h1>
            <p className="hero-subtitle">
              {t('home.description')}
            </p>
            
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.getStarted')}
                </motion.span>
              </Link>
              <Link to="/courses" className="btn btn-secondary">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.browseCourses')}
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

                  <div className="user-details">
                    <h1>{t('common.user')}</h1>
                    <p>{t('home.userLevel', { level: '12', xp: '2,850' })}</p>
                  </div>
                </div>
                <div className="streak">🔥 {t('home.dayStreak', { days: '7' })}</div>
              </div>
              <div className="progress-section">
                <h5>{t('home.currentProgress')}</h5>
                <div className="progress-item">
                  <span>{t('home.reactMastery')}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <span>{t('home.javascriptAdvanced')}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
              <div className="badges-section">
                <h5>{t('home.recentBadges')}</h5>
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


      <section className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="section-header"
          >
            <h2 className="section-title">{t('home.whyChooseUs')}</h2>
            <p className="section-subtitle">
              {t('home.featuresDescription')}
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
            <h2 className="cta-title">{t('home.ctaTitle')}</h2>
            <p className="cta-subtitle">
              {t('home.ctaSubtitle')}
            </p>
            <Link to="/dashboard" className="btn btn-cta">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('home.getStartedNow')}
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;