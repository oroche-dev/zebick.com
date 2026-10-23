import React, { useState, useEffect, useRef } from 'react';

// Animated Text with Letter-by-Letter Reveal
export const AnimatedText = ({ 
  text, 
  className = '', 
  delay = 0, 
  duration = 0.05,
  type = 'fade' // 'fade', 'slide', 'bounce', 'typewriter', 'glow'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (type === 'typewriter') {
    return (
      <span 
        ref={ref}
        className={className}
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderRight: isVisible ? '3px solid var(--accent-primary)' : 'none',
          width: isVisible ? 'auto' : '0',
          animation: isVisible 
            ? `typewriter 2s steps(${text.length}) ${delay}s forwards, blinkCursor 0.75s step-end infinite`
            : 'none',
        }}
      >
        {text}
      </span>
    );
  }

  const letters = text.split('');

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block' }}>
      {letters.map((letter, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: `all ${duration * 2}s cubic-bezier(0.4, 0, 0.2, 1)`,
            transitionDelay: `${delay + index * duration}s`,
            whiteSpace: letter === ' ' ? 'pre' : 'normal',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </span>
  );
};

// Word-by-Word Animation
export const AnimatedWords = ({ 
  text, 
  className = '', 
  delay = 0,
  staggerDelay = 0.1 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {words.map((word, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            filter: isVisible ? 'blur(0)' : 'blur(8px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${delay + index * staggerDelay}s`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

// Scroll reveal wrapper — fades/slides any content in once it enters the
// viewport. direction: 'up' | 'down' | 'left' | 'right'. Use `delay` (seconds)
// for staggering siblings, e.g. items.map((item, i) => <Reveal delay={i * 0.08}>...
const REVEAL_OFFSETS = {
  up: 'translateY(30px)',
  down: 'translateY(-30px)',
  left: 'translateX(-40px)',
  right: 'translateX(40px)',
};

export const Reveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  style = {},
  as: Tag = 'div',
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : (REVEAL_OFFSETS[direction] || REVEAL_OFFSETS.up),
        transition: `opacity ${duration}s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform ${duration}s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Counter Animation
export const AnimatedCounter = ({ 
  end, 
  duration = 2, 
  suffix = '', 
  prefix = '',
  className = '' 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const numericEnd = parseInt(end.toString().replace(/\D/g, ''));
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * numericEnd));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
};

// Gradient Text Animation
export const GradientText = ({ children, className = '' }) => {
  return (
    <span 
      className={`animate-gradient-text ${className}`}
      style={{
        background: 'linear-gradient(90deg, #FF6B00, #FF8A33, #FFB366, #FF8A33, #FF6B00)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'gradientShift 4s ease infinite',
      }}
    >
      {children}
    </span>
  );
};

// Glowing Text
export const GlowingText = ({ children, className = '' }) => {
  return (
    <span 
      className={className}
      style={{
        animation: 'textGlow 3s ease-in-out infinite',
        color: 'var(--accent-primary)',
      }}
    >
      {children}
    </span>
  );
};

// Split Line Animation (for headings)
export const SplitLineHeading = ({ 
  line1, 
  line2, 
  className = '',
  line2Gradient = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {line1}
        </div>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
            ...(line2Gradient && {
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8A33 50%, #FFB366 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }),
          }}
        >
          {line2}
        </div>
      </div>
    </div>
  );
};

// Scramble Text Effect
export const ScrambleText = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, text]);

  return (
    <span ref={ref} className={className} style={{ fontFamily: 'monospace' }}>
      {displayText}
    </span>
  );
};

export default AnimatedText;
