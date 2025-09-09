# Smooth Responsive Animations Library

A high-performance, accessible animation library designed for modern web applications. This library provides smooth, responsive animations that enhance user experience without compromising page performance.

## 🚀 Features

- **Performance Optimized**: GPU-accelerated animations using CSS transforms and opacity
- **Intersection Observer**: Animations trigger only when elements are visible
- **Mobile Responsive**: Optimized animations for mobile devices
- **Accessibility First**: Respects `prefers-reduced-motion` settings
- **Browser Compatible**: Works with all modern browsers (IE11+)
- **Lightweight**: Minimal footprint with maximum impact
- **Easy Integration**: Simple class-based system with JavaScript utilities

## 📦 Installation

### Option 1: Direct Download
1. Download the CSS and JavaScript files:
   - `smooth-animations.css`
   - `smooth-animations.js`

2. Include them in your HTML:
```html
<link rel="stylesheet" href="path/to/smooth-animations.css">
<script src="path/to/smooth-animations.js"></script>
```

### Option 2: CDN (if hosted)
```html
<link rel="stylesheet" href="https://your-cdn.com/smooth-animations.css">
<script src="https://your-cdn.com/smooth-animations.js"></script>
```

## 🎯 Quick Start

### Basic Usage

1. **Add animation classes to your HTML elements:**
```html
<div class="fade-in">This will fade in when visible</div>
<div class="slide-in-up">This will slide up when visible</div>
<div class="scale-in" data-animate-delay="300">This will scale in with a delay</div>
```

2. **The JavaScript will automatically initialize:**
```javascript
// Auto-initialization happens on DOM ready
// No additional code needed for basic usage
```

### Advanced Usage

```javascript
// Custom initialization with options
const animations = new SmoothAnimations({
    threshold: 0.2,        // Trigger when 20% visible
    once: true,           // Animate only once
    mobile: true,         // Enable on mobile
    reducedMotion: true,  // Respect accessibility preferences
    duration: 600         // Default animation duration
});

// Add elements programmatically
animations.addElement(document.querySelector('.my-element'), {
    delay: 500,
    callback: (element) => console.log('Animation started!'),
    resetCallback: (element) => console.log('Animation reset!')
});

// Trigger animations manually
animations.trigger('.my-selector');

// Stagger animations
animations.stagger('.list-item', {
    staggerDelay: 100,
    delay: 200
});
```

## 🎨 Available Animations

### Fade Animations
- `fade-in` - Simple opacity transition
- `fade-in-up` - Fade with upward movement
- `fade-in-down` - Fade with downward movement
- `fade-in-left` - Fade from left side
- `fade-in-right` - Fade from right side

### Slide Animations
- `slide-in-up` - Slide from bottom
- `slide-in-down` - Slide from top
- `slide-in-left` - Slide from left
- `slide-in-right` - Slide from right

### Scale Animations
- `scale-in` - Scale from center
- `scale-in-up` - Scale with upward origin
- `scale-in-center` - Perfect center scaling

### Bounce Animations
- `bounce-in` - Playful bounce effect
- `bounce-in-up` - Bounce from bottom

### Special Effects
- `rotate-in` - 360° rotation entrance
- `flip-in-x` - Horizontal flip effect
- `flip-in-y` - Vertical flip effect
- `zoom-in` - Dramatic zoom entrance
- `blur-in` - Focus blur transition

### Hover Effects
- `hover-lift` - Lift on hover
- `hover-glow` - Glow effect on hover
- `hover-scale` - Scale on hover
- `hover-rotate` - Rotate on hover

## ⚙️ Configuration Options

### Data Attributes
Customize animations using data attributes:

```html
<!-- Animation delay in milliseconds -->
<div class="fade-in" data-animate-delay="500">Delayed animation</div>

<!-- Custom duration -->
<div class="slide-in-up" data-animate-duration="800">Slower animation</div>

<!-- Animate multiple times -->
<div class="bounce-in" data-animate-once="false">Repeating animation</div>
```

### JavaScript Configuration

```javascript
// Performance-focused setup
const performanceAnimations = SmoothAnimationsUtils.performanceSetup();

// Accessibility-focused setup
const accessibleAnimations = SmoothAnimationsUtils.accessibilitySetup();

// Custom configuration
const customAnimations = new SmoothAnimations({
    threshold: 0.1,           // Intersection threshold (0-1)
    rootMargin: '0px 0px -50px 0px', // Root margin for intersection
    once: true,               // Animate only once
    duration: 600,            // Default duration in ms
    delay: 0,                 // Default delay in ms
    mobile: true,             // Enable on mobile devices
    reducedMotion: true       // Respect prefers-reduced-motion
});
```

## 📱 Mobile Optimization

The library automatically detects mobile devices and applies optimizations:

- Reduced animation complexity
- Shorter durations
- Simplified effects
- Optional mobile disable

```javascript
// Disable animations on mobile for better performance
const animations = new SmoothAnimations({
    mobile: false
});
```

## ♿ Accessibility Features

### Reduced Motion Support
Automatically respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
    /* Animations are automatically disabled */
}
```

### Accessibility Best Practices
- Animations don't interfere with screen readers
- Keyboard navigation remains functional
- Focus indicators are preserved
- Motion can be completely disabled

```javascript
// Force accessibility mode
const accessibleAnimations = new SmoothAnimations({
    reducedMotion: true,
    duration: 200,  // Shorter animations
    mobile: true
});
```

## 🔧 Advanced Features

### Stagger Animations
Create sequential animations for multiple elements:

```html
<div class="stagger-container">
    <div class="fade-in stagger-item">Item 1</div>
    <div class="fade-in stagger-item">Item 2</div>
    <div class="fade-in stagger-item">Item 3</div>
</div>
```

```javascript
// Stagger with 100ms delay between items
animations.stagger('.stagger-item', {
    staggerDelay: 100,
    delay: 0
});
```

### Manual Control
Trigger animations programmatically:

```javascript
// Trigger specific elements
animations.trigger('.my-element');

// Trigger with custom options
animations.trigger('.my-element', {
    delay: 300,
    callback: () => console.log('Done!')
});

// Add new elements dynamically
const newElement = document.createElement('div');
newElement.className = 'fade-in';
animations.addElement(newElement);
```

### Performance Monitoring

```javascript
// Monitor animation performance
const animations = new SmoothAnimations({
    // ... options
});

// Check if animations are enabled
if (animations.shouldEnableAnimations()) {
    console.log('Animations are active');
}

// Get element count
console.log('Animated elements:', animations.elements.size);
```

## 🌐 Browser Compatibility

| Browser | Version | Support |
|---------|---------|----------|
| Chrome | 51+ | ✅ Full |
| Firefox | 55+ | ✅ Full |
| Safari | 12.1+ | ✅ Full |
| Edge | 15+ | ✅ Full |
| IE | 11+ | ⚠️ Fallback |

### Fallback Support
For older browsers without Intersection Observer:

```javascript
// Automatic fallback is provided
// Animations will trigger immediately on page load
```

## 📊 Performance Guidelines

### Best Practices
1. **Use transform and opacity**: These properties are GPU-accelerated
2. **Limit concurrent animations**: Don't animate too many elements simultaneously
3. **Use `will-change` sparingly**: The library manages this automatically
4. **Test on mobile devices**: Always verify performance on target devices

### Performance Tips

```css
/* Good - GPU accelerated */
.animate {
    transform: translateX(100px);
    opacity: 0;
}

/* Avoid - causes layout thrashing */
.animate {
    left: 100px;
    width: 200px;
}
```

```javascript
// Performance-optimized initialization
const animations = new SmoothAnimations({
    threshold: 0.2,     // Higher threshold = fewer triggers
    once: true,         // Animate only once
    mobile: false,      // Disable on mobile if needed
    duration: 400       // Shorter animations
});
```

## 🎛️ API Reference

### SmoothAnimations Class

#### Constructor
```javascript
new SmoothAnimations(options)
```

#### Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `addElement(element, options)` | Add element to animation system | `element`: DOM element, `options`: Animation options |
| `removeElement(element)` | Remove element from system | `element`: DOM element |
| `trigger(selector, options)` | Manually trigger animation | `selector`: CSS selector or element, `options`: Animation options |
| `stagger(selector, options)` | Create staggered animations | `selector`: CSS selector, `options`: Stagger options |
| `refresh()` | Rediscover elements | None |
| `destroy()` | Clean up and destroy instance | None |

#### Utility Functions

```javascript
// Quick setups
SmoothAnimationsUtils.quickSetup()        // Default settings
SmoothAnimationsUtils.performanceSetup()  // Performance optimized
SmoothAnimationsUtils.accessibilitySetup() // Accessibility focused
```

## 🔍 Troubleshooting

### Common Issues

**Animations not triggering:**
- Check if elements have animation classes
- Verify Intersection Observer support
- Check console for JavaScript errors

**Poor performance:**
- Reduce number of concurrent animations
- Use performance setup: `SmoothAnimationsUtils.performanceSetup()`
- Test on target devices

**Accessibility concerns:**
- Use accessibility setup: `SmoothAnimationsUtils.accessibilitySetup()`
- Test with `prefers-reduced-motion: reduce`
- Verify keyboard navigation works

### Debug Mode

```javascript
// Enable debug logging
const animations = new SmoothAnimations({
    debug: true  // Add this option for debugging
});

// Check animation status
console.log('Should enable animations:', animations.shouldEnableAnimations());
console.log('Is mobile:', animations.isMobile);
console.log('Prefers reduced motion:', animations.prefersReducedMotion);
```

## 📝 Examples

### Basic Website Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="smooth-animations.css">
</head>
<body>
    <header class="fade-in">
        <h1>Welcome to My Site</h1>
    </header>
    
    <main>
        <section class="slide-in-up" data-animate-delay="200">
            <h2>About Us</h2>
            <p>Content here...</p>
        </section>
        
        <section class="fade-in-left" data-animate-delay="400">
            <h2>Services</h2>
            <div class="service-grid">
                <div class="service-item scale-in" data-animate-delay="600">Service 1</div>
                <div class="service-item scale-in" data-animate-delay="700">Service 2</div>
                <div class="service-item scale-in" data-animate-delay="800">Service 3</div>
            </div>
        </section>
    </main>
    
    <script src="smooth-animations.js"></script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect, useRef } from 'react';

function AnimatedComponent() {
    const elementRef = useRef(null);
    
    useEffect(() => {
        if (window.smoothAnimations && elementRef.current) {
            window.smoothAnimations.addElement(elementRef.current, {
                delay: 300,
                callback: () => console.log('React component animated!')
            });
        }
    }, []);
    
    return (
        <div ref={elementRef} className="fade-in">
            <h2>Animated React Component</h2>
        </div>
    );
}
```

### Vue.js Integration

```vue
<template>
    <div ref="animatedElement" class="slide-in-up">
        <h2>Animated Vue Component</h2>
    </div>
</template>

<script>
export default {
    mounted() {
        if (window.smoothAnimations && this.$refs.animatedElement) {
            window.smoothAnimations.addElement(this.$refs.animatedElement, {
                delay: 200
            });
        }
    }
}
</script>
```

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## 📞 Support

For questions and support:
- Check the troubleshooting section
- Review the demo page: `animation-demos.html`
- Test with different browsers and devices

---

**Happy Animating! 🎉**