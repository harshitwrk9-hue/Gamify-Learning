import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaClock, FaCheck, FaTimes, FaStar, FaRedo, FaChartLine, FaTrophy, FaLightbulb, FaArrowRight, FaArrowLeft, FaFlag, FaCoins, FaFire } from 'react-icons/fa';
import { quizzes } from '../data/mockData';
import InstantRewards from '../components/gamification/InstantRewards';
import './Assessment.css';

const Assessment = () => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizState, setQuizState] = useState('selection'); // selection, taking, results, analytics
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const categories = ['all', 'Math', 'Science', 'Programming', 'History', 'Language'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter quizzes based on category and difficulty
  const filteredQuizzes = quizzes.filter(quiz => {
    const categoryMatch = selectedCategory === 'all' || quiz.category === selectedCategory;
    const difficultyMatch = difficulty === 'all' || quiz.difficulty === difficulty;
    return categoryMatch && difficultyMatch;
  });

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizState === 'taking' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizState('taking');
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    setScore(0);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
    
    // Instant feedback for correct answers
    const question = currentQuiz.questions[questionIndex];
    const isCorrect = answerIndex === question.correctAnswer;
    
    if (isCorrect && window.eduquestRewards) {
      window.eduquestRewards.correctAnswer(currentQuiz.difficulty.toLowerCase());
    }
    
    // Show explanation after selection
    setTimeout(() => setShowExplanation(true), 500);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExplanation(false);
    } else {
      handleQuizComplete();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleQuizComplete = () => {
    let correctAnswers = 0;
    const questionResults = currentQuiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Not answered',
        correctAnswer: question.options[question.correctAnswer],
        isCorrect,
        explanation: question.explanation
      };
    });

    const finalScore = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    const xpEarned = Math.round(finalScore * 2); // 2 XP per percentage point
    
    setScore(finalScore);
    
    // Trigger quiz completion rewards
    if (window.eduquestRewards) {
      setTimeout(() => {
        window.eduquestRewards.quizComplete(finalScore);
      }, 1000);
    }
    setQuizResults({
      score: finalScore,
      correctAnswers,
      totalQuestions: currentQuiz.questions.length,
      xpEarned,
      timeSpent: (currentQuiz.timeLimit * 60) - timeLeft,
      questionResults
    });
    setQuizState('results');
  };

  const retakeQuiz = () => {
    startQuiz(currentQuiz);
  };

  const goToSelection = () => {
    setQuizState('selection');
    setCurrentQuiz(null);
    setQuizResults(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#ef4444';
    return '#6b7280';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  if (quizState === 'taking' && currentQuiz) {
    const question = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="assessment taking">
        <div className="quiz-container">
          {/* Quiz Header */}
          <div className="quiz-header">
            <div className="quiz-info">
              <h2>{currentQuiz.title}</h2>
              <div className="quiz-meta">
                <span className="question-counter">
                  Question {currentQuestion + 1} of {currentQuiz.questions.length}
                </span>
                <div className="timer">
                  <FaClock className="timer-icon" />
                  <span className={timeLeft < 60 ? 'time-warning' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
            <div className="quiz-progress">
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="progress-text">{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Question Card */}
          <motion.div 
            className="question-card"
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="question-header">
              <div className="question-type">
                <FaLightbulb className="question-icon" />
                <span>Multiple Choice</span>
              </div>
              <div className="question-points">
                <FaStar className="points-icon" />
                <span>{question.points || 10} points</span>
              </div>
            </div>
            
            <h3 className="question-text">{question.question}</h3>
            
            <div className="options-container">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  className={`option-btn ${
                    answers[currentQuestion] === index ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                  <div className="option-text">{option}</div>
                  {answers[currentQuestion] === index && (
                    <motion.div 
                      className="option-check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <FaCheck />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {showExplanation && question.explanation && (
              <motion.div 
                className="explanation-card"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="explanation-header">
                  <FaLightbulb className="explanation-icon" />
                  <span>Explanation</span>
                </div>
                <p>{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="quiz-navigation">
            <button 
              className="nav-btn prev-btn"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              <FaArrowLeft className="nav-icon" />
              Previous
            </button>
            
            <div className="nav-center">
              <button 
                className="explanation-btn"
                onClick={() => setShowExplanation(!showExplanation)}
                disabled={!question.explanation}
              >
                <FaLightbulb className="btn-icon" />
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </button>
            </div>
            
            <button 
              className="nav-btn next-btn"
              onClick={nextQuestion}
              disabled={answers[currentQuestion] === undefined}
            >
              {currentQuestion === currentQuiz.questions.length - 1 ? (
                <>
                  <FaFlag className="nav-icon" />
                  Finish Quiz
                </>
              ) : (
                <>
                  Next
                  <FaArrowRight className="nav-icon" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'results' && quizResults) {
    return (
      <div className="assessment results">
        <div className="results-container">
          {/* Results Header */}
          <motion.div 
            className="results-header"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="results-celebration">
              <motion.div 
                className="trophy-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <FaTrophy />
              </motion.div>
              <h2>Quiz Complete!</h2>
              <p>Great job on completing "{currentQuiz.title}"</p>
            </div>
          </motion.div>

          {/* Score Card */}
          <motion.div 
            className="score-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="score-display">
              <div className="score-circle" style={{ borderColor: getScoreColor(quizResults.score) }}>
                <span className="score-number" style={{ color: getScoreColor(quizResults.score) }}>
                  {quizResults.score}%
                </span>
                <span className="score-grade">{getScoreGrade(quizResults.score)}</span>
              </div>
              <div className="score-details">
                <div className="score-stat">
                  <span className="stat-label">Correct Answers</span>
                  <span className="stat-value">{quizResults.correctAnswers}/{quizResults.totalQuestions}</span>
                </div>
                <div className="score-stat">
                  <span className="stat-label">XP Earned</span>
                  <span className="stat-value xp-earned">+{quizResults.xpEarned} XP</span>
                </div>
                <div className="score-stat">
                  <span className="stat-label">Time Spent</span>
                  <span className="stat-value">{formatTime(quizResults.timeSpent)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Question Review */}
          <motion.div 
            className="question-review"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <h3>Question Review</h3>
            <div className="review-list">
              {quizResults.questionResults.map((result, index) => (
                <div key={index} className={`review-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-header">
                    <div className="question-number">Q{index + 1}</div>
                    <div className={`result-icon ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.isCorrect ? <FaCheck /> : <FaTimes />}
                    </div>
                  </div>
                  <div className="review-content">
                    <p className="review-question">{result.question}</p>
                    <div className="review-answers">
                      <div className="answer-row">
                        <span className="answer-label">Your Answer:</span>
                        <span className={`answer-text ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                          {result.userAnswer}
                        </span>
                      </div>
                      {!result.isCorrect && (
                        <div className="answer-row">
                          <span className="answer-label">Correct Answer:</span>
                          <span className="answer-text correct">{result.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                    {result.explanation && (
                      <div className="review-explanation">
                        <FaLightbulb className="explanation-icon" />
                        <p>{result.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="results-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <button className="action-btn secondary" onClick={goToSelection}>
              <FaArrowLeft className="btn-icon" />
              Back to Quizzes
            </button>
            <button className="action-btn primary" onClick={retakeQuiz}>
              <FaRedo className="btn-icon" />
              Retake Quiz
            </button>
            <button className="action-btn analytics" onClick={() => setQuizState('analytics')}>
              <FaChartLine className="btn-icon" />
              View Analytics
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Selection Screen
  return (
    <div className="assessment selection">
      <div className="assessment-container">
        {/* Header */}
        <motion.div 
          className="assessment-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <div className="title-section">
              <h1>
                <FaChartLine className="title-icon" />
                Assessment Center
              </h1>
              <p>Test your knowledge and track your progress</p>
            </div>
            <div className="user-progress">
              <div className="progress-stat">
                <div className="stat-icon">
                  <FaTrophy />
                </div>
                <div className="stat-info">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Quizzes Completed</div>
                </div>
              </div>
              <div className="progress-stat">
                <div className="stat-icon">
                  <FaStar />
                </div>
                <div className="stat-info">
                  <div className="stat-number">87%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="filters-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="filter-group">
            <label>Category:</label>
            <div className="filter-options">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-option ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Difficulty:</label>
            <div className="filter-options">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  className={`filter-option ${difficulty === diff ? 'active' : ''}`}
                  onClick={() => setDifficulty(diff)}
                >
                  {diff === 'all' ? 'All Levels' : diff}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quiz Grid */}
        <motion.div 
          className="quiz-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              className="quiz-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="quiz-header">
                <div className="quiz-category">{quiz.category}</div>
                <div className={`quiz-difficulty ${quiz.difficulty.toLowerCase()}`}>
                  {quiz.difficulty}
                </div>
              </div>
              
              <div className="quiz-content">
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>
                
                <div className="quiz-stats">
                  <div className="stat">
                    <span className="stat-label">Questions:</span>
                    <span className="stat-value">{quiz.questions.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Time:</span>
                    <span className="stat-value">{quiz.timeLimit} min</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Points:</span>
                    <span className="stat-value">{quiz.totalPoints}</span>
                  </div>
                </div>
              </div>
              
              <div className="quiz-footer">
                <div className="quiz-attempts">
                  <span>Best Score: {quiz.bestScore || 'Not attempted'}%</span>
                </div>
                <button 
                  className="start-quiz-btn"
                  onClick={() => startQuiz(quiz)}
                >
                  <FaPlay className="btn-icon" />
                  Start Quiz
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredQuizzes.length === 0 && (
          <motion.div 
            className="no-quizzes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FaChartLine className="no-quizzes-icon" />
            <h3>No quizzes found</h3>
            <p>Try adjusting your filters to see more quizzes.</p>
          </motion.div>
        )}
      </div>
      
      {/* Instant Rewards System */}
      <InstantRewards 
        currentXP={1250}
        currentCoins={450}
        currentLevel={8}
        onRewardEarned={(reward) => {
          console.log('Reward earned:', reward);
          // Here you would typically update user stats in your state management
        }}
      />
    </div>
  );
};

export default Assessment;