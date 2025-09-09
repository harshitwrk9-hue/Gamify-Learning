import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaSave, FaTimes, FaTrophy, FaFire, FaGraduationCap, FaClock } from 'react-icons/fa';
import { currentUser, badges, achievements } from '../data/mockData';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...currentUser });

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({ ...currentUser });
    setIsEditing(false);
  };

  const userBadges = badges.filter(badge => currentUser.badges.includes(badge.id));
  const userAchievements = achievements.slice(0, 5); // Show recent achievements

  return (
    <motion.div 
      className="profile-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={currentUser.avatar} alt={currentUser.name} />
          <div className="level-badge">
            Level {currentUser.level}
          </div>
        </div>
        
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="edit-input"
              />
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                className="edit-input"
              />
              <div className="edit-actions">
                <button onClick={handleSave} className="btn-save">
                  <FaSave /> Save
                </button>
                <button onClick={handleCancel} className="btn-cancel">
                  <FaTimes /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <h1>{currentUser.name}</h1>
              <p className="email">{currentUser.email}</p>
              <p className="join-date">Member since {new Date(currentUser.joinDate).toLocaleDateString()}</p>
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                <FaEdit /> Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaTrophy />
          </div>
          <div className="stat-info">
            <h3>{currentUser.xp}</h3>
            <p>Total XP</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaFire />
          </div>
          <div className="stat-info">
            <h3>{currentUser.streak}</h3>
            <p>Day Streak</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaGraduationCap />
          </div>
          <div className="stat-info">
            <h3>{currentUser.completedCourses.length}</h3>
            <p>Courses Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-info">
            <h3>{currentUser.weeklyProgress}/{currentUser.weeklyGoal}</h3>
            <p>Weekly Goal</p>
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="badges-section">
          <h2>Badges</h2>
          <div className="badges-grid">
            {userBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                className="badge-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="badge-icon">{badge.icon}</div>
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
                <span className={`badge-rarity ${badge.rarity.toLowerCase()}`}>
                  {badge.rarity}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="achievements-section">
          <h2>Recent Achievements</h2>
          <div className="achievements-list">
            {userAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className="achievement-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="achievement-icon">
                  {achievement.type === 'course' && <FaGraduationCap />}
                  {achievement.type === 'quiz' && <FaTrophy />}
                  {achievement.type === 'lesson' && <FaClock />}
                  {achievement.type === 'milestone' && <FaFire />}
                </div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <span className="achievement-date">{new Date(achievement.date).toLocaleDateString()}</span>
                </div>
                <div className="achievement-xp">
                  +{achievement.xpEarned} XP
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;