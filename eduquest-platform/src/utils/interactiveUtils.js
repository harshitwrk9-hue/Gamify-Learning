/**
 * Interactive Utilities
 * Handles enhanced interactions, accessibility, and cross-device compatibility
 */


export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};


export const deviceUtils = {
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },
  
  getViewportSize: () => {
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
  }
};


export const addRippleEffect = (element) => {
  if (!element) return;
  
  element.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1000;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  });
};


export const focusUtils = {
  
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  },
  
  
  handleFocusVisible: () => {
    let hadKeyboardEvent = true;
    const keyboardThrottledUpdateHadKeyboardEvent = throttle(() => {
      hadKeyboardEvent = true;
    }, 100);
    
    document.addEventListener('keydown', keyboardThrottledUpdateHadKeyboardEvent);
    document.addEventListener('mousedown', () => { hadKeyboardEvent = false; });
    document.addEventListener('pointerdown', () => { hadKeyboardEvent = false; });
    document.addEventListener('touchstart', () => { hadKeyboardEvent = false; });
    
    document.addEventListener('focusin', (e) => {
      if (hadKeyboardEvent) {
        e.target.classList.add('focus-visible');
      }
    });
    
    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('focus-visible');
    });
  }
};


export const touchUtils = {
  
  addSwipeGesture: (element, callbacks) => {
    let startX, startY, startTime;
    const threshold = 50;
  const restraint = 100;
  const allowedTime = 300;
    
    element.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      startX = touch.pageX;
      startY = touch.pageY;
      startTime = new Date().getTime();
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const distX = touch.pageX - startX;
      const distY = touch.pageY - startY;
      const elapsedTime = new Date().getTime() - startTime;
      
      if (elapsedTime <= allowedTime) {
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          const direction = distX < 0 ? 'left' : 'right';
          if (callbacks[direction]) callbacks[direction](e);
        } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
          const direction = distY < 0 ? 'up' : 'down';
          if (callbacks[direction]) callbacks[direction](e);
        }
      }
    }, { passive: true });
  },
  

  addLongPress: (element, callback, duration = 500) => {
    let timer;
    
    const start = (e) => {
      timer = setTimeout(() => callback(e), duration);
    };
    
    const cancel = () => {
      if (timer) clearTimeout(timer);
    };
    
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', cancel);
    element.addEventListener('touchmove', cancel);
    element.addEventListener('touchcancel', cancel);
  }
};


export const keyboardUtils = {
  
  addArrowNavigation: (container, itemSelector) => {
    container.addEventListener('keydown', (e) => {
      const items = Array.from(container.querySelectorAll(itemSelector));
      const currentIndex = items.indexOf(document.activeElement);
      let nextIndex;
      
      switch (e.key) {
        case 'ArrowDown':
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case 'ArrowUp':
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'ArrowRight':
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }
      
      e.preventDefault();
      if (items[nextIndex]) {
        items[nextIndex].focus();
      }
    });
  },
  
  
  addActivationKeys: (element, callback) => {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback(e);
      }
    });
  }
};


export const animationUtils = {
  
  scrollToElement: (element, options = {}) => {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    };
    
    element.scrollIntoView({ ...defaultOptions, ...options });
  },
  
  
  animateIn: (element, animation = 'fadeInUp', duration = 300) => {
    element.style.animation = `${animation} ${duration}ms ease-out forwards`;
  },
  
  
  animateOut: (element, animation = 'fadeOut', duration = 300) => {
    return new Promise((resolve) => {
      element.style.animation = `${animation} ${duration}ms ease-in forwards`;
      setTimeout(resolve, duration);
    });
  },
  
  
  staggerAnimation: (elements, animation = 'fadeInUp', delay = 100) => {
    elements.forEach((element, index) => {
      setTimeout(() => {
        animationUtils.animateIn(element, animation);
      }, index * delay);
    });
  }
};


export const performanceUtils = {

  measureInteraction: (name, fn) => {
    return function(...args) {
      const start = performance.now();
      const result = fn.apply(this, args);
      const end = performance.now();
      
      if (end - start > 16) {
        console.warn(`Slow interaction: ${name} took ${end - start}ms`);
      }
      
      return result;
    };
  },
  

  createIntersectionObserver: (callback, options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
  }
};


export const a11yUtils = {
  
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(announcer);
    announcer.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },
  
  
  setARIA: (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(`aria-${key}`, value);
    });
  },
  
  
  addSkipLink: (targetId, text = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 10000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
};


export const initializeInteractiveEnhancements = () => {

  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    
    .focus-visible {
      outline: 2px solid #667eea !important;
      outline-offset: 2px !important;
    }
    
    .skip-link:focus {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
  

  focusUtils.handleFocusVisible();
  

  document.querySelectorAll('button, .btn, .course-button, .action-btn').forEach(addRippleEffect);
  

  const mainContent = document.querySelector('main, #root, .app');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
  if (mainContent) {
    a11yUtils.addSkipLink('main-content');
  }
  

  const courseGrids = document.querySelectorAll('.courses-grid, .course-catalog');
  courseGrids.forEach(grid => {
    keyboardUtils.addArrowNavigation(grid, '.course-card, .course-item');
  });
  

  if (deviceUtils.isTouchDevice()) {
    document.body.classList.add('touch-device');
    
  
    const carousels = document.querySelectorAll('.carousel, .slider');
    carousels.forEach(carousel => {
      touchUtils.addSwipeGesture(carousel, {
        left: () => console.log('Swipe left'),
        right: () => console.log('Swipe right')
      });
    });
  }
  

  if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 100) {
          console.warn(`Long task detected: ${entry.duration}ms`);
        }
      });
    });
    observer.observe({ entryTypes: ['longtask'] });
  }
  
  console.log('Interactive enhancements initialized successfully!');
};


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeInteractiveEnhancements);
} else {
  initializeInteractiveEnhancements();
}

const interactiveUtils = {
  debounce,
  throttle,
  deviceUtils,
  addRippleEffect,
  focusUtils,
  touchUtils,
  keyboardUtils,
  animationUtils,
  performanceUtils,
  a11yUtils,
  initializeInteractiveEnhancements
};

export default interactiveUtils;