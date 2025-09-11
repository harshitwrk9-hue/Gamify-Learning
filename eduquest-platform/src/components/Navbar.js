import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBook, FaTrophy, FaUser, FaBars, FaTimes, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { currentUser } from '../data/mockData';
import { ReactComponent as ShikshaLogo } from '../assets/shiksha-logo.svg';
import { ReactComponent as UserAvatar } from '../assets/user-avatar.svg';
import LanguageSwitcher from './LanguageSwitcher/LanguageSwitcher';

import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser: authUser, logout } = useAuth();


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

        <Link to="/" className="navbar-logo">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="logo-container"
          >
            <ShikshaLogo className="logo-icon" />
            <span className="logo-text">VidhyaSaathi</span>
          </motion.div>
        </Link>


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


        <div className="navbar-right">
          <LanguageSwitcher className="navbar-language-switcher" showLabel={false} />
          {authUser ? (
            <motion.div className="auth-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="logout-btn user-avatar-btn"
                title="Sign Out"
              >
                <UserAvatar className="user-avatar-icon" />
              </motion.button>
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
        </div>

  
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>


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

          <div className="mobile-language-switcher">
            <LanguageSwitcher showLabel={true} />
          </div>
          
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