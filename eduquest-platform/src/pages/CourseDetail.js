import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaClock, FaUsers, FaStar, FaBookmark } from 'react-icons/fa';
import { courses } from '../data/mockData';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const course = courses.find(c => c.id === parseInt(id));

  if (!course) {
    return (
      <div className="course-detail-container">
        <div className="course-not-found">
          <h2>Course not found</h2>
          <p>The course you're looking for doesn't exist.</p>
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
              <span>{course.students} students</span>
            </div>
            <div className="meta-item">
              <FaStar className="meta-icon" />
              <span>{course.rating}</span>
            </div>
          </div>
          
          <div className="course-actions">
            <button className="btn-primary">
              {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
            </button>
            <button className="btn-secondary">
              <FaBookmark /> Save
            </button>
          </div>
        </div>
      </div>
      
      <div className="course-content">
        <div className="course-lessons">
          <h3>Course Content</h3>
          <div className="lessons-list">
            {Array.from({ length: course.lessons }, (_, index) => (
              <div key={index} className="lesson-item">
                <div className="lesson-number">{index + 1}</div>
                <div className="lesson-info">
                  <h4>Lesson {index + 1}</h4>
                  <p>Duration: 25 min</p>
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
            <h4>Instructor</h4>
            <div className="instructor">
              <div className="instructor-avatar">
                <img src="/api/placeholder/60/60" alt={course.instructor} />
              </div>
              <div className="instructor-details">
                <h5>{course.instructor}</h5>
                <p>Expert Instructor</p>
              </div>
            </div>
          </div>
          
          <div className="course-stats">
            <h4>Course Statistics</h4>
            <div className="stat-item">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="stat-item">
              <span>XP Reward</span>
              <span>{course.xpReward} XP</span>
            </div>
            <div className="stat-item">
              <span>Difficulty</span>
              <span>{course.difficulty}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;