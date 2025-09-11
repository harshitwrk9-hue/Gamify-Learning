import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaStar, FaClock, FaPlay, FaCheck, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { courses, categories } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import './CourseCatalog.css';

const CourseCatalog = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const sortOptions = [
    { value: 'popular', label: t('courseCatalog.sortOptions.popular') },
    { value: 'rating', label: t('courseCatalog.sortOptions.rating') },
    { value: 'newest', label: t('courseCatalog.sortOptions.newest') },
    { value: 'progress', label: t('courseCatalog.sortOptions.progress') }
  ];


  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id - a.id;
        case 'progress':
          return b.progress - a.progress;
        default:
          return b.students - a.students;
      }
    });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getProgressStatus = (progress) => {
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  return (
    <div className="course-catalog">
      <div className="catalog-container">
  
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="catalog-header animate-fade-in-up"
        >
          <div className="header-content">
            <h1>{t('courseCatalog.title')}</h1>
            <p>{t('courseCatalog.subtitle')}</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{courses.length}</span>
              <span className="stat-label">{t('courseCatalog.stats.courses')}</span>
            </div>
            <div className="stat">
              <span className="stat-number">{categories.length}</span>
              <span className="stat-label">{t('courseCatalog.stats.categories')}</span>
            </div>
          </div>
        </motion.div>

  
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="categories-section animate-slide-in-left"
        >
          <h2>{t('courseCatalog.browseByCategory')}</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className={`category-card animate-fade-in-scale border-glow ${
                  selectedCategory === category.name ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <h3>{category.name}</h3>
                <p>{category.courseCount} {t('courseCatalog.coursesCount')}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

  
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="filters-section animate-slide-in-right glass-card"
        >
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('courseCatalog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>{t('courseCatalog.filters.category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">{t('courseCatalog.filters.allCategories')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('courseCatalog.filters.difficulty')}</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'All' ? t('courseCatalog.filters.allLevels') : t(`courseCatalog.difficulty.${difficulty.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>{t('courseCatalog.filters.sortBy')}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

  
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="results-section animate-fade-in-up"
        >
          <div className="results-header">
            <h2>{t('courseCatalog.coursesWithCount', { count: filteredCourses.length })}</h2>
            {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
              <button
                className="clear-filters"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }}
              >
                {t('courseCatalog.clearFilters')}
              </button>
            )}
          </div>

          <div className="courses-grid">
            {filteredCourses.map((course, index) => {
              const progressStatus = getProgressStatus(course.progress);
              return (
                <Link 
                  to={`/course/${course.id}`} 
                  key={course.id}
                  className="course-card-link"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                    whileHover={{ y: -10 }}
                    className={`course-card ${progressStatus} animate-fade-in-scale border-glow`}
                  >
                  <div className="course-image">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="course-overlay">
                      <Link to={`/course/${course.id}`} className="play-button">
                        {progressStatus === 'completed' ? <FaCheck /> : <FaPlay />}
                      </Link>
                    </div>
                    <div className="course-badges">
                      <span 
                        className="difficulty-badge"
                        style={{ background: getDifficultyColor(course.difficulty) }}
                      >
                        {course.difficulty}
                      </span>
                      {progressStatus === 'completed' && (
                        <span className="completed-badge">
                          <FaCheck /> {t('courseCatalog.courseStatus.completed')}
                        </span>
                      )}
                      {progressStatus === 'in-progress' && (
                        <span className="progress-badge">
                          {course.progress}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="course-category">{course.category}</div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>

                  <div className="course-instructor">
                    <span>{t('courseCatalog.instructorBy', { instructor: course.instructor })}</span>
                  </div>

                  <div className="course-meta">
                    <div className="meta-item">
                      <FaStar className="meta-icon" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="meta-item">
                      <FaUsers className="meta-icon" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="meta-item">
                      <FaClock className="meta-icon" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {course.progress > 0 && (
                    <div className="course-progress">
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          style={{ background: course.color }}
                        />
                      </div>
                      <span className="progress-text">
                        {t('courseCatalog.lessonsCompleted', { completed: course.completedLessons, total: course.lessons })}
                      </span>
                    </div>
                  )}

                  <div className="course-footer">
                    <div className="xp-reward">
                      <span>+{course.xpReward} XP</span>
                    </div>
                    <div className="course-button" onClick={(e) => e.preventDefault()}>
                        {progressStatus === 'completed' ? t('courseCatalog.courseActions.review') :
                         progressStatus === 'in-progress' ? t('courseCatalog.courseActions.continue') : t('courseCatalog.courseActions.start')}
                    </div>
                  </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="no-results"
            >
              <h3>{t('courseCatalog.noResults.title')}</h3>
              <p>{t('courseCatalog.noResults.description')}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CourseCatalog;