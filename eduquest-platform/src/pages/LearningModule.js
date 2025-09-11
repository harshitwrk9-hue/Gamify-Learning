import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaForward, 
  FaBackward, 
  FaCheck, 
  FaTimes, 
  FaStar, 
  FaTrophy, 
  FaLightbulb,
  FaBookOpen,
  FaVideo,
  FaQuestionCircle,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaUsers
} from 'react-icons/fa';
import { courses, lessons, quizzes } from '../data/mockData';
import './LearningModule.css';

const LearningModule = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const [earnedXP, setEarnedXP] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
  
    const course = courses.find(c => c.id === parseInt(courseId));
    const lesson = lessons.find(l => l.id === parseInt(lessonId));
    const quiz = quizzes.find(q => q.lessonId === parseInt(lessonId));
    
    setCurrentCourse(course);
    setCurrentLesson(lesson);
    setCurrentQuiz(quiz);
    
  
    const timer = setInterval(() => {
      setLessonProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [courseId, lessonId]);

  const handleQuizStart = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuizSubmit = () => {
    let correctAnswers = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    setScore(finalScore);
    setQuizCompleted(true);

    

    const baseXP = 50;
    const bonusXP = Math.round(finalScore * 0.5);
    const totalXP = baseXP + bonusXP;
    setEarnedXP(totalXP);
    

    setTimeout(() => {
      setShowXPAnimation(true);
    }, 1000);
  };

  const handleRetakeQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);

    setShowXPAnimation(false);
  };

  const handleNextLesson = () => {
    const currentLessonIndex = lessons.findIndex(l => l.id === parseInt(lessonId));
    const nextLesson = lessons[currentLessonIndex + 1];
    
    if (nextLesson) {
      navigate(`/learning/${courseId}/${nextLesson.id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePrevLesson = () => {
    const currentLessonIndex = lessons.findIndex(l => l.id === parseInt(lessonId));
    const prevLesson = lessons[currentLessonIndex - 1];
    
    if (prevLesson) {
      navigate(`/learning/${courseId}/${prevLesson.id}`);
    }
  };

  const toggleVideo = () => {
    setVideoPlaying(!videoPlaying);
  };

  const handleReadingScroll = (e) => {
    const element = e.target;
    const scrollPercent = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setReadingProgress(Math.min(scrollPercent, 100));
  };

  if (!currentLesson || !currentCourse) {
    return (
      <div className="learning-module loading">
        <div className="loading-spinner">
          <FaBookOpen className="spin" />
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="learning-module animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >

      <motion.div 
        className="module-header animate-slide-in-down"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="breadcrumb">
            <span onClick={() => navigate('/courses')} className="breadcrumb-link">
              {currentCourse.title}
            </span>
            <FaArrowRight className="breadcrumb-arrow" />
            <span className="current-lesson">{currentLesson.title}</span>
          </div>
          
          <div className="lesson-meta">
            <div className="meta-item">
              <FaClock className="meta-icon" />
              <span>{currentLesson.duration}</span>
            </div>
            <div className="meta-item">
              <FaUsers className="meta-icon" />
              <span>{currentLesson.difficulty}</span>
            </div>
          </div>
        </div>
        
        <div className="lesson-progress-header">
          <div className="progress-info">
            <span className="progress-text">{Math.round(lessonProgress)}% Complete</span>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${lessonProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="module-content animate-fade-in-up"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >

        <div className="content-area">

          <motion.div 
            className="lesson-content"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="lesson-title">{currentLesson.title}</h1>
            

            {currentLesson.type === 'video' && (
              <div className="video-section">
                <div className="video-player">
                  <div className="video-placeholder">
                    <FaVideo className="video-icon" />
                    <h3>Video: {currentLesson.title}</h3>
                    <p>Interactive video content would be embedded here</p>
                    
                    <div className="video-controls">
                      <button 
                        className="play-btn"
                        onClick={toggleVideo}
                      >
                        {videoPlaying ? <FaPause /> : <FaPlay />}
                        {videoPlaying ? 'Pause' : 'Play'}
                      </button>
                      <button className="control-btn">
                        <FaBackward />
                      </button>
                      <button className="control-btn">
                        <FaForward />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            

            {currentLesson.type === 'reading' && (
              <div className="reading-section">
                <div 
                  className="reading-content"
                  onScroll={handleReadingScroll}
                >
                  <div className="reading-progress">
                    <div className="reading-progress-bar">
                      <div 
                        className="reading-progress-fill"
                        style={{ width: `${readingProgress}%` }}
                      />
                    </div>
                    <span className="reading-progress-text">
                      Reading Progress: {Math.round(readingProgress)}%
                    </span>
                  </div>
                  
                  <div className="text-content">
                    <h2>Introduction to {currentLesson.title}</h2>
                    <p>
                      Welcome to this comprehensive lesson on {currentLesson.title.toLowerCase()}. 
                      In this module, you'll learn the fundamental concepts and practical applications 
                      that will help you master this important topic.
                    </p>
                    
                    <h3>Key Learning Objectives</h3>
                    <ul>
                      <li>Understand the core principles and concepts</li>
                      <li>Learn practical applications and real-world examples</li>
                      <li>Develop problem-solving skills in this domain</li>
                      <li>Apply knowledge through hands-on exercises</li>
                    </ul>
                    
                    <h3>Detailed Content</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
                      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 
                      commodo consequat.
                    </p>
                    
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
                      dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
                      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    
                    <div className="highlight-box">
                      <FaLightbulb className="highlight-icon" />
                      <div>
                        <h4>Pro Tip</h4>
                        <p>
                          Remember to practice regularly and apply these concepts in real scenarios 
                          to reinforce your learning and build confidence.
                        </p>
                      </div>
                    </div>
                    
                    <h3>Summary</h3>
                    <p>
                      By completing this lesson, you've gained valuable insights into {currentLesson.title.toLowerCase()}. 
                      Make sure to review the key concepts and complete the quiz to test your understanding.
                    </p>
                  </div>
                </div>
              </div>
            )}
            

            <div className="interactive-elements">
              <div className="element-grid">
                <div className="element-card">
                  <FaBookOpen className="element-icon" />
                  <h4>Study Notes</h4>
                  <p>Key concepts and important points</p>
                </div>
                <div className="element-card">
                  <FaLightbulb className="element-icon" />
                  <h4>Practice Exercises</h4>
                  <p>Hands-on activities to reinforce learning</p>
                </div>
                <div className="element-card">
                  <FaQuestionCircle className="element-icon" />
                  <h4>Discussion Forum</h4>
                  <p>Ask questions and share insights</p>
                </div>
              </div>
            </div>
          </motion.div>

          
          {currentQuiz && (
            <motion.div 
              className="quiz-section"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="quiz-header">
                <h2>Knowledge Check</h2>
                <p>Test your understanding of the lesson content</p>
              </div>

              {!quizStarted ? (
                <div className="quiz-start">
                  <div className="quiz-info">
                    <div className="info-item">
                      <FaQuestionCircle className="info-icon" />
                      <span>{currentQuiz.questions.length} Questions</span>
                    </div>
                    <div className="info-item">
                      <FaClock className="info-icon" />
                      <span>~{currentQuiz.questions.length * 2} minutes</span>
                    </div>
                    <div className="info-item">
                      <FaStar className="info-icon" />
                      <span>Earn up to 100 XP</span>
                    </div>
                  </div>
                  
                  <button className="start-quiz-btn" onClick={handleQuizStart}>
                    <FaPlay className="btn-icon" />
                    Start Quiz
                  </button>
                </div>
              ) : (
                <div className="quiz-content">
                  {!quizCompleted ? (
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={currentQuestion}
                        className="question-container"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="question-header">
                          <span className="question-number">
                            Question {currentQuestion + 1} of {currentQuiz.questions.length}
                          </span>
                          <div className="question-progress">
                            <div 
                              className="question-progress-fill"
                              style={{ 
                                width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                        
                        <h3 className="question-text">
                          {currentQuiz.questions[currentQuestion].question}
                        </h3>
                        
                        <div className="answers-grid">
                          {currentQuiz.questions[currentQuestion].options.map((option, index) => (
                            <motion.button
                              key={index}
                              className={`answer-option ${
                                selectedAnswers[currentQuestion] === index ? 'selected' : ''
                              }`}
                              onClick={() => handleAnswerSelect(currentQuestion, index)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="option-letter">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="option-text">{option}</span>
                            </motion.button>
                          ))}
                        </div>
                        
                        <div className="question-navigation">
                          <button 
                            className="nav-btn prev-btn"
                            onClick={handlePrevQuestion}
                            disabled={currentQuestion === 0}
                          >
                            <FaArrowLeft /> Previous
                          </button>
                          
                          <button 
                            className="nav-btn next-btn"
                            onClick={handleNextQuestion}
                            disabled={selectedAnswers[currentQuestion] === undefined}
                          >
                            {currentQuestion === currentQuiz.questions.length - 1 ? (
                              <>Submit Quiz <FaCheck /></>
                            ) : (
                              <>Next <FaArrowRight /></>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <motion.div 
                      className="quiz-results"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="results-header">
                        <div className="score-circle">
                          <div className="score-number">{score}%</div>
                          <div className="score-label">Score</div>
                        </div>
                        
                        <div className="results-info">
                          <h3>
                            {score >= 80 ? (
                              <>Excellent Work! <FaTrophy className="trophy-icon" /></>
                            ) : score >= 60 ? (
                              'Good Job!'
                            ) : (
                              'Keep Practicing!'
                            )}
                          </h3>
                          <p>
                            You answered {Object.values(selectedAnswers).filter((answer, index) => 
                              answer === currentQuiz.questions[index].correctAnswer
                            ).length} out of {currentQuiz.questions.length} questions correctly.
                          </p>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {showXPAnimation && (
                          <motion.div 
                            className="xp-earned"
                            initial={{ y: 50, opacity: 0, scale: 0.5 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 300, 
                              damping: 20 
                            }}
                          >
                            <FaStar className="xp-icon" />
                            <span className="xp-text">+{earnedXP} XP Earned!</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div className="results-actions">
                        <button className="retake-btn" onClick={handleRetakeQuiz}>
                          <FaTimes className="btn-icon" />
                          Retake Quiz
                        </button>
                        
                        <button className="continue-btn" onClick={handleNextLesson}>
                          Continue Learning
                          <FaArrowRight className="btn-icon" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>


        <div className="module-sidebar">
          <div className="sidebar-section">
            <h3>Course Progress</h3>
            <div className="course-lessons">
              {lessons
                .filter(lesson => lesson.courseId === parseInt(courseId))
                .map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className={`lesson-item ${
                    lesson.id === parseInt(lessonId) ? 'current' : ''
                  } ${lesson.completed ? 'completed' : ''}`}
                  onClick={() => navigate(`/learning/${courseId}/${lesson.id}`)}
                >
                  <div className="lesson-number">{index + 1}</div>
                  <div className="lesson-info">
                    <div className="lesson-name">{lesson.title}</div>
                    <div className="lesson-duration">{lesson.duration}</div>
                  </div>
                  {lesson.completed && <FaCheck className="completed-icon" />}
                </div>
              ))}
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn">
                <FaBookOpen className="action-icon" />
                Take Notes
              </button>
              <button className="action-btn">
                <FaQuestionCircle className="action-icon" />
                Ask Question
              </button>
              <button className="action-btn">
                <FaUsers className="action-icon" />
                Join Discussion
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      
      <motion.div className="module-footer">
        <button 
          className="nav-footer-btn prev"
          onClick={handlePrevLesson}
          disabled={lessons.findIndex(l => l.id === parseInt(lessonId)) === 0}
        >
          <FaArrowLeft /> Previous Lesson
        </button>
        
        <div className="lesson-completion">
          {lessonProgress === 100 && (
            <motion.div 
              className="completion-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaCheck className="completion-icon" />
              Lesson Complete!
            </motion.div>
          )}
        </div>
        
        <button 
          className="nav-footer-btn next"
          onClick={handleNextLesson}
          disabled={lessonProgress < 100}
        >
          Next Lesson <FaArrowRight />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LearningModule;