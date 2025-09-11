import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaClock, FaUsers, FaStar, FaBookmark, FaSpinner, FaRocket } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { courses } from '../data/mockData';
import './CourseDetail.css';

const CourseDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === parseInt(id));
  const [isStarting, setIsStarting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if course is bookmarked on component mount
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCourses') || '[]');
    setIsBookmarked(bookmarks.includes(course?.id));
  }, [course?.id]);

  const handleStartCourse = async () => {
    setIsStarting(true);
    
    // Simulate course initialization
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to course learning interface or first lesson
    if (course.progress > 0) {
      // Continue from where user left off
      navigate(`/course/${course.id}/lesson/${course.completedLessons + 1}`);
    } else {
      // Start from the beginning
      navigate(`/course/${course.id}/lesson/1`);
    }
    
    setIsStarting(false);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to localStorage or send to backend
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedCourses') || '[]');
    if (!isBookmarked) {
      bookmarks.push(course.id);
      localStorage.setItem('bookmarkedCourses', JSON.stringify(bookmarks));
    } else {
      const updatedBookmarks = bookmarks.filter(id => id !== course.id);
      localStorage.setItem('bookmarkedCourses', JSON.stringify(updatedBookmarks));
    }
  };

  if (!course) {
    return (
      <div className="course-detail-container">
        <div className="course-not-found">
          <h2>{t('courseDetail.notFound.title')}</h2>
          <p>{t('courseDetail.notFound.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="course-detail-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="course-header">
        <div className="course-thumbnail">
          <img src={course.thumbnail} alt={course.title} />
          <div className="play-overlay">
            <FaPlay className="play-icon" />
          </div>
        </div>
        
        <div className="course-info">
          <h1>{course.title}</h1>
          <p className="course-description">{course.description}</p>
          
          <div className="course-meta">
            <div className="meta-item">
              <FaClock className="meta-icon" />
              <span>{course.duration}</span>
            </div>
            <div className="meta-item">
              <FaUsers className="meta-icon" />
              <span>{course.students} {t('courseDetail.meta.students')}</span>
            </div>
            <div className="meta-item">
              <FaStar className="meta-icon" />
              <span>{course.rating}</span>
            </div>
          </div>
          
          <div className="course-actions">
            <motion.button 
              className={`btn-primary start-course-btn ${isStarting ? 'loading' : ''}`}
              onClick={handleStartCourse}
              disabled={isStarting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isStarting ? (
                <>
                  <FaSpinner className="spinner" />
                  {t('courseDetail.actions.starting')}
                </>
              ) : (
                <>
                  {course.progress > 0 ? (
                    <>
                      <FaPlay className="btn-icon" />
                      {t('courseDetail.actions.continue')}
                    </>
                  ) : (
                    <>
                      <FaRocket className="btn-icon" />
                      {t('courseDetail.actions.start')}
                    </>
                  )}
                </>
              )}
            </motion.button>
            <motion.button 
              className={`btn-secondary ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaBookmark className={isBookmarked ? 'bookmarked-icon' : ''} /> 
              {isBookmarked ? t('courseDetail.actions.saved') : t('courseDetail.actions.save')}
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="course-content">
        <div className="course-lessons">
          <h3>{t('courseDetail.content.title')}</h3>
          <div className="lessons-list">
            {Array.from({ length: course.lessons }, (_, index) => (
              <div key={index} className="lesson-item">
                <div className="lesson-number">{index + 1}</div>
                <div className="lesson-info">
                  <h4>{t('courseDetail.content.lesson')} {index + 1}</h4>
                  <p>{t('courseDetail.content.duration')}: 25 min</p>
                </div>
                <div className="lesson-status">
                  {index < course.completedLessons ? (
                    <span className="completed">✓</span>
                  ) : (
                    <span className="pending">○</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="course-sidebar">
          <div className="instructor-info">
            <h4>{t('courseDetail.instructor.title')}</h4>
            <div className="instructor">
              <div className="instructor-avatar">
                <img src="/api/placeholder/60/60" alt={course.instructor} />
              </div>
              <div className="instructor-details">
                <h5>{course.instructor}</h5>
                <p>{t('courseDetail.instructor.expert')}</p>
              </div>
            </div>
          </div>
          
          <div className="course-stats">
            <h4>{t('courseDetail.stats.title')}</h4>
            <div className="stat-item">
              <span>{t('courseDetail.stats.progress')}</span>
              <span>{course.progress}%</span>
            </div>
            <div className="stat-item">
              <span>{t('courseDetail.stats.xpReward')}</span>
              <span>{course.xpReward} XP</span>
            </div>
            <div className="stat-item">
              <span>{t('courseDetail.stats.difficulty')}</span>
              <span>{course.difficulty}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;