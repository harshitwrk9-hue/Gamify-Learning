import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './ParticleSystem.css';

const FloatingElements = ({ 
  elementCount = 12, 
  className = '',
  types = ['star', 'diamond', 'circle']
}) => {
  const [elements, setElements] = useState([]);
  

  const memoizedTypes = useMemo(() => types, [types.join(',')]);
  

  const generateElements = useCallback(() => {
    const newElements = [];
    for (let i = 0; i < elementCount; i++) {
      const type = memoizedTypes[Math.floor(Math.random() * memoizedTypes.length)];
      newElements.push({
        id: i,
        type,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDuration: 4 + Math.random() * 4,
        animationDelay: Math.random() * 3,
        scale: 0.5 + Math.random() * 0.8
      });
    }
    setElements(newElements);
  }, [elementCount, memoizedTypes]);

  useEffect(() => {
    generateElements();
  }, [generateElements]);

  return (
    <div className={`floating-elements ${className}`}>
      {elements.map((element) => (
        <div
          key={element.id}
          className={`floating-element ${element.type}`}
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
            animationDuration: `${element.animationDuration}s`,
            animationDelay: `${element.animationDelay}s`,
            transform: `scale(${element.scale})`
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;