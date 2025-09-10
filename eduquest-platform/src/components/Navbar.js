import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBook, FaTrophy, FaUser, FaBars, FaTimes, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { currentUser } from '../data/mockData';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser: authUser, logout } = useAuth();

  // Only show navigation items if user is authenticated
  const navItems = authUser ? [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/courses', label: 'Courses', icon: FaBook },
    { path: '/leaderboard', label: 'Leaderboard', icon: FaTrophy },
    { path: '/profile', label: 'Profile', icon: FaUser }
  ] : [];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    navigate('/auth');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="logo-container"
          >
            <span className="logo-icon">🎓</span>
            <span className="logo-text">EduQuest</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className="navbar-link"
                >
                  <Icon className="navbar-icon" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* User Info or Auth Buttons */}
        {authUser ? (
          <motion.div 
            className="navbar-user"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="user-stats">
              <div className="user-xp">
                <span className="xp-label">XP</span>
                <span className="xp-value">{currentUser.xp.toLocaleString()}</span>
              </div>
              <motion.div 
                className="user-level"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="level-badge">Lv. {currentUser.level}</span>
              </motion.div>
            </div>
            <div className="user-actions">
              <Link to="/profile" className="user-avatar">
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  src={currentUser.avatar}
                  alt={authUser.username}
                  className="avatar-image"
                />
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="logout-btn"
                title="Logout"
              >
                <FaSignOutAlt />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div className="auth-buttons">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="login-btn"
            >
              <FaSignInAlt className="auth-icon" />
              <span>Sign In</span>
            </motion.button>
          </motion.div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mobile-menu-content">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-menu-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="mobile-menu-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {authUser ? (
            <>
              <div className="mobile-user-info">
                <div className="mobile-xp">
                  <span>XP: {currentUser.xp.toLocaleString()}</span>
                  <span>Level: {currentUser.level}</span>
                </div>
              </div>
              <button 
                className="mobile-logout-btn"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mobile-menu-icon" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button 
              className="mobile-login-btn"
              onClick={handleLogin}
            >
              <FaSignInAlt className="mobile-menu-icon" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;