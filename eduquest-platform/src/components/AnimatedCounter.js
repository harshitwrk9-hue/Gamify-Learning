import React, { useState, useEffect, useRef } from 'react';
import './AnimatedCounter.css';

const AnimatedCounter = ({ 
  value, 
  duration = 2000, 
  decimals = 0, 
  prefix = '', 
  suffix = '',
  className = '',
  enableMorphing = true 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible]);

  const startAnimation = () => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const change = endValue - startValue;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (change * easeOutCubic);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const formatNumber = (num) => {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderMorphingDigits = (numStr) => {
    return numStr.split('').map((char, index) => (
      <span 
        key={index} 
        className={`digit ${char === ',' ? 'comma' : ''}`}
        style={{
          animationDelay: `${index * 0.1}s`
        }}
      >
        {char}
      </span>
    ));
  };

  const formattedValue = formatNumber(displayValue);

  return (
    <div 
      ref={counterRef}
      className={`animated-counter ${className} ${isVisible ? 'visible' : ''}`}
    >
      <span className="counter-prefix">{prefix}</span>
      <span className="counter-value">
        {enableMorphing ? renderMorphingDigits(formattedValue) : formattedValue}
      </span>
      <span className="counter-suffix">{suffix}</span>
    </div>
  );
};

export default AnimatedCounter;