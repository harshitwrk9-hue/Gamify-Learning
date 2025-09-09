# Animation Library Troubleshooting Guide

## Common Issues and Solutions

### 1. Animations Not Working

**Symptoms:**
- Elements don't animate when scrolling
- No visual effects appear
- Console shows JavaScript errors

**Solutions:**

#### Check File Paths
Ensure all files are in the same directory:
```
C:\gammyy\
├── smooth-animations.css
├── smooth-animations.js
├── animation-demos.html
└── test-animations.html
```

#### Verify HTML Structure
Make sure your HTML includes both CSS and JS files:
```html
<link rel="stylesheet" href="smooth-animations.css">
<script src="smooth-animations.js"></script>
```

#### Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Common errors:
   - "SmoothAnimations is not defined" → JS file not loaded
   - "Failed to load resource" → File path incorrect

### 2. Animations Too Fast/Slow

**Solution:**
Customize animation timing in your initialization:
```javascript
const animations = new SmoothAnimations({
    duration: 800, // Slower animations
    threshold: 0.1 // Trigger earlier
});
```

### 3. Mobile Issues

**Symptoms:**
- Animations don't work on mobile devices
- Performance issues on touch devices

**Solutions:**

#### Enable Mobile Animations
```javascript
const animations = new SmoothAnimations({
    mobile: true // Ensure mobile is enabled
});
```

#### Add Mobile CSS
Include the mobile configuration file:
```html
<link rel="stylesheet" href="mobile-accessibility-config.css">
```

### 4. Accessibility Issues

**Symptoms:**
- Animations cause motion sickness
- Users with vestibular disorders experience discomfort

**Solutions:**

#### Respect Reduced Motion Preference
The library automatically detects `prefers-reduced-motion`, but you can force it:
```javascript
const animations = new SmoothAnimations({
    reducedMotion: true
});
```

#### Add Manual Controls
```html
<button onclick="toggleAnimations()">Toggle Animations</button>
```

### 5. Performance Issues

**Symptoms:**
- Page feels sluggish
- Animations are choppy
- High CPU usage

**Solutions:**

#### Optimize Animation Count
- Limit simultaneous animations
- Use `once: true` for one-time animations
- Reduce animation duration for better performance

#### Check Hardware Acceleration
Ensure CSS transforms are used (automatically handled by the library):
```css
.animate-element {
    will-change: transform, opacity;
    transform: translateZ(0); /* Force hardware acceleration */
}
```

### 6. Browser Compatibility

**Supported Browsers:**
- Chrome 58+
- Firefox 55+
- Safari 12+
- Edge 79+

**Fallbacks:**
For older browsers, animations gracefully degrade to show content without effects.

### 7. Testing Your Setup

#### Quick Test
1. Open `test-animations.html` in your browser
2. Check the status indicator in the top-right corner
3. Scroll down to see if animations trigger
4. Open browser console for detailed logs

#### Manual Testing
```javascript
// Test in browser console
if (typeof SmoothAnimations !== 'undefined') {
    console.log('✅ Library loaded successfully');
} else {
    console.log('❌ Library not loaded');
}
```

### 8. Getting Help

#### Debug Information
When reporting issues, include:
- Browser version
- Operating system
- Console error messages
- HTML structure
- Animation configuration

#### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `SmoothAnimations is not defined` | JS file not loaded | Check file path |
| `Cannot read property 'observe'` | Intersection Observer not supported | Use polyfill |
| `Animation not triggering` | Element not in viewport | Adjust threshold |
| `Performance issues` | Too many animations | Reduce concurrent animations |

### 9. Advanced Configuration

#### Custom Animation Timing
```javascript
const animations = new SmoothAnimations({
    threshold: 0.1,        // Trigger when 10% visible
    rootMargin: '0px 0px -50px 0px', // Trigger 50px before
    once: true,            // Animate only once
    duration: 600,         // 600ms duration
    delay: 0,              // No delay
    mobile: true,          // Enable on mobile
    reducedMotion: true    // Respect accessibility
});
```

#### Performance Monitoring
```javascript
// Monitor animation performance
if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            console.log('Animation performance:', entry);
        });
    });
    observer.observe({entryTypes: ['measure']});
}
```

---

## Quick Checklist

- [ ] All files in same directory
- [ ] CSS and JS files linked correctly
- [ ] Browser console shows no errors
- [ ] Elements have animation classes
- [ ] SmoothAnimations initialized
- [ ] Test page works correctly
- [ ] Mobile configuration included (if needed)
- [ ] Accessibility settings configured

If you're still experiencing issues after following this guide, the problem might be specific to your setup or browser configuration.