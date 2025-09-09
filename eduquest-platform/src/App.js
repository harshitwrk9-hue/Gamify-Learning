import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';

// Components
import Navbar from './components/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import LearningModule from './pages/LearningModule';
import Leaderboard from './pages/Leaderboard';

import Profile from './pages/Profile';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navbar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/learn/:courseId/:lessonId" element={<LearningModule />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              <Route path="/profile" element={<Profile />} />
            </Routes>
          </motion.main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
