import React, { useEffect, useRef, useState } from 'react';
import './ParticleSystem.css';

const ParticleSystem = ({ 
  particleCount = 50, 
  particleColor = '#4f46e5', 
  particleSize = 2, 
  speed = 1,
  interactive = true,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = particlesRef.current;


    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);


    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * particleSize + 1,
          opacity: Math.random() * 0.5 + 0.2,
          hue: Math.random() * 60 + 200,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 100
        });
      }
    };

    initParticles();


    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }


    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
  
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

  
        if (interactive) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;
          }
        }

  
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

  
        particle.vx *= 0.99;
        particle.vy *= 0.99;

  
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = Math.max(0, 0.7 * (1 - lifeRatio));

  
        if (particle.life > particle.maxLife) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.vx = (Math.random() - 0.5) * speed;
          particle.vy = (Math.random() - 0.5) * speed;
          particle.life = 0;
          particle.hue = Math.random() * 60 + 200;
        }

  
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
  
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, `hsl(${particle.hue}, 70%, 60%)`);
        gradient.addColorStop(0.5, `hsl(${particle.hue}, 70%, 40%)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
  
        ctx.fillStyle = `hsl(${particle.hue}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

  
      particles.forEach((particle1, i) => {
        particles.slice(i + 1).forEach(particle2 => {
          const dx = particle1.x - particle2.x;
          const dy = particle1.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.save();
            ctx.globalAlpha = (120 - distance) / 120 * 0.2;
            ctx.strokeStyle = `hsl(${(particle1.hue + particle2.hue) / 2}, 60%, 50%)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };


    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animate();
        } else {
          setIsVisible(false);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      observer.disconnect();
    };
  }, [particleCount, particleColor, particleSize, speed, interactive]);

  return (
    <canvas 
      ref={canvasRef}
      className={`particle-system ${className} ${isVisible ? 'active' : ''}`}
    />
  );
};

export default ParticleSystem;