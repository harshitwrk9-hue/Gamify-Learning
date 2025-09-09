import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBook, FaTrophy, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { currentUser } from '../data/mockData';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/courses', label: 'Courses', icon: FaBook },
    { path: '/leaderboard', label: 'Leaderboard', icon: FaTrophy },
    { path: '/profile', label: 'Profile', icon: FaUser }
  ];

  const isActive = (path) => location.pathname === path;

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

        {/* User Info */}
        <div className="navbar-user">
          <div className="user-xp">
            <span className="xp-label">XP</span>
            <span className="xp-value">{currentUser.xp.toLocaleString()}</span>
          </div>
          <div className="user-level">
            <span className="level-badge">Lv. {currentUser.level}</span>
          </div>
          <Link to="/profile" className="user-avatar">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={currentUser.avatar}
              alt={currentUser.name}
              className="avatar-image"
            />
          </Link>
        </div>

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
          <div className="mobile-user-info">
            <div className="mobile-xp">
              <span>XP: {currentUser.xp.toLocaleString()}</span>
              <span>Level: {currentUser.level}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;