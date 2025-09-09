/**
 * Smooth Responsive Animation Library - JavaScript Utilities
 * Performance-optimized animation controller with Intersection Observer
 * Compatible with modern browsers and mobile devices
 */

class SmoothAnimations {
  constructor(options = {}) {
    this.options = {
      // Default options
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
      once: true, // Animate only once
      duration: 600, // Default animation duration in ms
      delay: 0, // Default delay
      mobile: true, // Enable animations on mobile
      reducedMotion: true, // Respect prefers-reduced-motion
      ...options
    };

    this.observer = null;
    this.elements = new Map();
    this.isInitialized = false;
    this.isMobile = this.detectMobile();
    this.prefersReducedMotion = this.detectReducedMotion();

    // Bind methods
    this.handleIntersection = this.handleIntersection.bind(this);
    this.handleResize = this.handleResize.bind(this);
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the animation system
   */
  init() {
    if (this.isInitialized) return;

    // Check if animations should be disabled
    if (!this.shouldEnableAnimations()) {
      this.disableAnimations();
      return;
    }

    // Create intersection observer
    this.createObserver();
    
    // Add event listeners
    this.addEventListeners();
    
    // Auto-discover elements
    this.discoverElements();
    
    this.isInitialized = true;
  }

  /**
   * Create intersection observer
   */
  createObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.fallbackInit();
      return;
    }

    this.observer = new IntersectionObserver(this.handleIntersection, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    });
  }

  /**
   * Handle intersection observer callback
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const elementData = this.elements.get(element);
      
      if (!elementData) return;

      if (entry.isIntersecting) {
        // Element is visible, trigger animation
        this.animateElement(element, elementData);
        
        // If animate once, stop observing
        if (this.options.once || elementData.once) {
          this.observer.unobserve(element);
          this.elements.delete(element);
        }
      } else if (!this.options.once && !elementData.once) {
        // Element is not visible, reset animation
        this.resetElement(element, elementData);
      }
    });
  }

  /**
   * Animate element
   */
  animateElement(element, elementData) {
    // Apply delay if specified
    const delay = elementData.delay || this.options.delay;
    
    if (delay > 0) {
      setTimeout(() => {
        this.triggerAnimation(element, elementData);
      }, delay);
    } else {
      this.triggerAnimation(element, elementData);
    }
  }

  /**
   * Trigger animation
   */
  triggerAnimation(element, elementData) {
    // Add active class
    element.classList.add('animate-active');
    
    // Add GPU acceleration for better performance
    element.style.willChange = 'transform, opacity';
    
    // Call custom callback if provided
    if (elementData.callback && typeof elementData.callback === 'function') {
      elementData.callback(element);
    }
    
    // Remove will-change after animation completes
    const duration = elementData.duration || this.options.duration;
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, duration + 100);
  }

  /**
   * Reset element animation
   */
  resetElement(element, elementData) {
    element.classList.remove('animate-active');
    
    // Call reset callback if provided
    if (elementData.resetCallback && typeof elementData.resetCallback === 'function') {
      elementData.resetCallback(element);
    }
  }

  /**
   * Add element to animation system
   */
  addElement(element, options = {}) {
    if (!element || this.elements.has(element)) return;

    const elementData = {
      once: options.once !== undefined ? options.once : this.options.once,
      delay: options.delay || 0,
      duration: options.duration || this.options.duration,
      callback: options.callback,
      resetCallback: options.resetCallback,
      ...options
    };

    this.elements.set(element, elementData);
    
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  /**
   * Remove element from animation system
   */
  removeElement(element) {
    if (!element || !this.elements.has(element)) return;

    if (this.observer) {
      this.observer.unobserve(element);
    }
    
    this.elements.delete(element);
  }

  /**
   * Auto-discover elements with animation classes
   */
  discoverElements() {
    const animationClasses = [
      'fade-in', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right',
      'slide-in-up', 'slide-in-down', 'slide-in-left', 'slide-in-right',
      'scale-in', 'scale-in-up', 'scale-in-center',
      'bounce-in', 'bounce-in-up',
      'rotate-in', 'flip-in-x', 'flip-in-y',
      'zoom-in', 'blur-in'
    ];

    animationClasses.forEach(className => {
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach(element => {
        // Parse data attributes for custom options
        const options = this.parseElementOptions(element);
        this.addElement(element, options);
      });
    });
  }

  /**
   * Parse element data attributes for options
   */
  parseElementOptions(element) {
    const options = {};
    
    // Parse data attributes
    if (element.dataset.animateOnce !== undefined) {
      options.once = element.dataset.animateOnce !== 'false';
    }
    
    if (element.dataset.animateDelay) {
      options.delay = parseInt(element.dataset.animateDelay, 10);
    }
    
    if (element.dataset.animateDuration) {
      options.duration = parseInt(element.dataset.animateDuration, 10);
    }
    
    return options;
  }

  /**
   * Manually trigger animation for specific element
   */
  trigger(selector, options = {}) {
    const elements = typeof selector === 'string' 
      ? document.querySelectorAll(selector)
      : [selector];
    
    elements.forEach(element => {
      if (!element) return;
      
      const elementData = this.elements.get(element) || options;
      this.animateElement(element, elementData);
    });
  }

  /**
   * Stagger animations for multiple elements
   */
  stagger(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const staggerDelay = options.staggerDelay || 100;
    
    elements.forEach((element, index) => {
      const delay = (options.delay || 0) + (index * staggerDelay);
      const elementOptions = { ...options, delay };
      
      if (this.elements.has(element)) {
        // Update existing element
        const elementData = this.elements.get(element);
        elementData.delay = delay;
      } else {
        // Add new element
        this.addElement(element, elementOptions);
      }
    });
  }

  /**
   * Detect if device is mobile
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  /**
   * Detect if user prefers reduced motion
   */
  detectReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if animations should be enabled
   */
  shouldEnableAnimations() {
    // Respect user's reduced motion preference
    if (this.prefersReducedMotion && this.options.reducedMotion) {
      return false;
    }
    
    // Check mobile setting
    if (this.isMobile && !this.options.mobile) {
      return false;
    }
    
    return true;
  }

  /**
   * Disable all animations
   */
  disableAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .animate {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Fallback for browsers without Intersection Observer
   */
  fallbackInit() {
    // Simple fallback - trigger all animations immediately
    setTimeout(() => {
      this.elements.forEach((elementData, element) => {
        this.triggerAnimation(element, elementData);
      });
    }, 100);
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Handle resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.handleResize, 250);
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause animations when tab is not visible
        this.pauseAnimations();
      } else {
        // Resume animations when tab becomes visible
        this.resumeAnimations();
      }
    });
  }

  /**
   * Handle resize events
   */
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    
    // Reinitialize if mobile state changed
    if (wasMobile !== this.isMobile) {
      this.destroy();
      this.init();
    }
  }

  /**
   * Pause animations
   */
  pauseAnimations() {
    this.elements.forEach((elementData, element) => {
      element.style.animationPlayState = 'paused';
    });
  }

  /**
   * Resume animations
   */
  resumeAnimations() {
    this.elements.forEach((elementData, element) => {
      element.style.animationPlayState = 'running';
    });
  }

  /**
   * Refresh - rediscover elements and reinitialize
   */
  refresh() {
    this.discoverElements();
  }

  /**
   * Destroy the animation system
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.elements.clear();
    this.isInitialized = false;
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
  }
}

// Utility functions for easy integration
const SmoothAnimationsUtils = {
  /**
   * Initialize with default settings
   */
  init(options = {}) {
    return new SmoothAnimations(options);
  },

  /**
   * Quick setup for common use cases
   */
  quickSetup() {
    return new SmoothAnimations({
      threshold: 0.1,
      once: true,
      mobile: true,
      reducedMotion: true
    });
  },

  /**
   * Performance-focused setup
   */
  performanceSetup() {
    return new SmoothAnimations({
      threshold: 0.2,
      once: true,
      mobile: false, // Disable on mobile for better performance
      duration: 400, // Faster animations
      reducedMotion: true
    });
  },

  /**
   * Accessibility-focused setup
   */
  accessibilitySetup() {
    return new SmoothAnimations({
      threshold: 0.3,
      once: true,
      mobile: true,
      duration: 300, // Shorter animations
      reducedMotion: true // Always respect reduced motion
    });
  }
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize with default settings if no manual initialization
    if (!window.smoothAnimations) {
      window.smoothAnimations = SmoothAnimationsUtils.quickSetup();
    }
  });
} else {
  // DOM is already ready
  if (!window.smoothAnimations) {
    window.smoothAnimations = SmoothAnimationsUtils.quickSetup();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmoothAnimations, SmoothAnimationsUtils };
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.SmoothAnimations = SmoothAnimations;
  window.SmoothAnimationsUtils = SmoothAnimationsUtils;
}