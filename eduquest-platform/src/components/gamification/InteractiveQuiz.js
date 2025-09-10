import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, 
  FaTimes, 
  FaLightbulb, 
  FaClock, 
  FaStar,
  FaFire,
  FaCoins,
  FaArrowRight,
  FaArrowLeft,
  FaFlag,
  FaBolt
} from 'react-icons/fa';
import './InteractiveQuiz.css';

const InteractiveQuiz = ({ 
  question, 
  onAnswerSelect, 
  selectedAnswer, 
  showExplanation, 
  isCorrect, 
  questionNumber, 
  totalQuestions,
  timeLeft,
  difficulty = 'medium',
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious
}) => {
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(50);
  const [timeWarning, setTimeWarning] = useState(false);

  // Time warning effect
  useEffect(() => {
    if (timeLeft <= 30 && timeLeft > 0) {
      setTimeWarning(true);
    } else {
      setTimeWarning(false);
    }
  }, [timeLeft]);

  // Handle answer selection with immediate feedback
  const handleAnswerClick = (answerIndex) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    onAnswerSelect(answerIndex);
    
    const correct = answerIndex === question.correctAnswer;
    setAnswerFeedback({
      isCorrect: correct,
      selectedIndex: answerIndex,
      correctIndex: question.correctAnswer
    });

    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(correct ? [100] : [100, 50, 100]);
    }
  };

  // Get difficulty-based styling
  const getDifficultyColor = () => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#2196F3';
    }
  };

  // Get confidence-based bonus
  const getConfidenceBonus = () => {
    if (confidenceLevel >= 80) return 1.5;
    if (confidenceLevel >= 60) return 1.2;
    if (confidenceLevel >= 40) return 1.0;
    return 0.8;
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="interactive-quiz">
      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="question-progress">
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{ backgroundColor: getDifficultyColor() }}
            />
          </div>
          <span className="progress-text">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        
        <div className="quiz-stats">
          <div className={`timer ${timeWarning ? 'warning' : ''}`}>
            <FaClock className="timer-icon" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          
          <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor() }}>
            {difficulty}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <motion.div 
        className="question-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="question-text">{question.question}</h2>
        
        {question.image && (
          <div className="question-image">
            <img src={question.image} alt="Question illustration" />
          </div>
        )}

        {/* Confidence Slider */}
        {selectedAnswer === null && (
          <motion.div 
            className="confidence-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="confidence-label">
              How confident are you? (Affects bonus points)
            </label>
            <div className="confidence-slider">
              <input
                type="range"
                min="0"
                max="100"
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
                className="slider"
              />
              <div className="confidence-display">
                <span>{confidenceLevel}% confident</span>
                <span className="bonus-indicator">
                  Bonus: x{getConfidenceBonus().toFixed(1)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Answer Options */}
      <div className="answer-options">
        {question.options.map((option, index) => {
          let optionClass = 'answer-option';
          let optionIcon = null;
          
          if (answerFeedback) {
            if (index === answerFeedback.correctIndex) {
              optionClass += ' correct';
              optionIcon = <FaCheck className="option-icon" />;
            } else if (index === answerFeedback.selectedIndex && !answerFeedback.isCorrect) {
              optionClass += ' incorrect';
              optionIcon = <FaTimes className="option-icon" />;
            }
          } else if (selectedAnswer === index) {
            optionClass += ' selected';
          }

          return (
            <motion.button
              key={index}
              className={optionClass}
              onClick={() => handleAnswerClick(index)}
              disabled={selectedAnswer !== null}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={selectedAnswer === null ? { scale: 1.02, x: 10 } : {}}
              whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
            >
              <div className="option-content">
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                {optionIcon}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Hint Section */}
      {question.hint && (
        <div className="hint-section">
          <button 
            className="hint-button"
            onClick={() => setShowHint(!showHint)}
            disabled={selectedAnswer !== null}
          >
            <FaLightbulb className="hint-icon" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="hint-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaLightbulb className="hint-icon" />
                <p>{question.hint}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Explanation Section */}
      <AnimatePresence>
        {showExplanation && question.explanation && (
          <motion.div
            className="explanation-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="explanation-header">
              <h3>Explanation</h3>
              {answerFeedback && (
                <div className={`feedback-badge ${answerFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                  {answerFeedback.isCorrect ? (
                    <><FaCheck /> Correct!</>
                  ) : (
                    <><FaTimes /> Incorrect</>
                  )}
                </div>
              )}
            </div>
            <p className="explanation-text">{question.explanation}</p>
            
            {answerFeedback && answerFeedback.isCorrect && (
              <div className="reward-preview">
                <div className="reward-item">
                  <FaStar className="reward-icon" />
                  <span>+{Math.round(15 * getConfidenceBonus())} XP</span>
                </div>
                <div className="reward-item">
                  <FaCoins className="reward-icon" />
                  <span>+{Math.round(8 * getConfidenceBonus())} Coins</span>
                </div>
                {getConfidenceBonus() > 1 && (
                  <div className="bonus-indicator">
                    <FaBolt className="bonus-icon" />
                    <span>Confidence Bonus!</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button 
          className="nav-button prev"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          <FaArrowLeft /> Previous
        </button>
        
        <button 
          className="nav-button next"
          onClick={onNext}
          disabled={!canGoNext}
        >
          {questionNumber === totalQuestions ? (
            <><FaFlag /> Finish Quiz</>
          ) : (
            <>Next <FaArrowRight /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default InteractiveQuiz;