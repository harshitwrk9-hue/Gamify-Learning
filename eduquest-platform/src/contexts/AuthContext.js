import React, { createContext, useContext, useState, useEffect } from 'react';
import { hashPassword, verifyPassword } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('eduquest_user');
    const sessionToken = localStorage.getItem('eduquest_session');
    
    if (storedUser && sessionToken) {
      try {
        const user = JSON.parse(storedUser);
        // Verify session is still valid (24 hours)
        const sessionData = JSON.parse(sessionToken);
        const now = new Date().getTime();
        
        if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
          setCurrentUser(user);
        } else {
          // Session expired
          localStorage.removeItem('eduquest_user');
          localStorage.removeItem('eduquest_session');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('eduquest_user');
        localStorage.removeItem('eduquest_session');
      }
    }
    setLoading(false);
  }, []);

  const register = async (username, password) => {
    setError('');
    setLoading(true);

    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('eduquest_users') || '[]');
      const userExists = existingUsers.find(user => user.username === username);
      
      if (userExists) {
        throw new Error('Username already exists');
      }

      // Validate input
      if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        // Default user data for EduQuest
        name: username,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        weeklyProgress: 0,
        weeklyGoal: 5,
        completedCourses: [],
        currentCourses: [],
        badges: []
      };

      // Save to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('eduquest_users', JSON.stringify(existingUsers));
      
      // Create session
      const sessionData = {
        userId: newUser.id,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('eduquest_session', JSON.stringify(sessionData));
      localStorage.setItem('eduquest_user', JSON.stringify(newUser));
      
      setCurrentUser(newUser);
      return { success: true, user: newUser };
      
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setError('');
    setLoading(true);

    try {
      // Get users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('eduquest_users') || '[]');
      const user = existingUsers.find(u => u.username === username);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid username or password');
      }

      // Create session
      const sessionData = {
        userId: user.id,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('eduquest_session', JSON.stringify(sessionData));
      localStorage.setItem('eduquest_user', JSON.stringify(user));
      
      setCurrentUser(user);
      return { success: true, user };
      
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('eduquest_user');
    localStorage.removeItem('eduquest_session');
    setCurrentUser(null);
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};