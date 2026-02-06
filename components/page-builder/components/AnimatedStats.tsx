import React, { useState, useEffect, useRef } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface AnimatedStatsProps {
  element: PageElement;
}

export function AnimatedStats({ element }: AnimatedStatsProps) {
  const stats = element.content.stats || [];
  const animationType = element.content.animationType || 'countUp';
  const triggerOnScroll = element.content.triggerOnScroll !== false;
  const duration = element.content.duration || 2000;
  const format = element.content.format || 'number';
  const [hasTriggered, setHasTriggered] = useState(!triggerOnScroll);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerOnScroll || hasTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasTriggered(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [triggerOnScroll, hasTriggered]);

  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  const CountUp = ({ target, label }: { target: number; label: string }) => {
    const [current, setCurrent] = useState(0);
    
    useEffect(() => {
      if (!hasTriggered) return;
      
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        setCurrent((prev) => {
          const next = prev + increment;
          return next >= target ? target : next;
        });
      }, 16);
      
      return () => clearInterval(timer);
    }, [hasTriggered, target, duration]);

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--page-primary, #6366f1)', marginBottom: '8px' }}>
          {formatValue(Math.floor(current))}
        </div>
        <div style={{ fontSize: '16px', color: 'var(--page-text, #a3a3a3)' }}>
          {label}
        </div>
      </div>
    );
  };

  const ProgressRing = ({ value, label, max = 100 }: { value: number; label: string; max?: number }) => {
    const percentage = (value / max) * 100;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ textAlign: 'center' }}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--page-border, #262626)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--page-primary, #6366f1)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{ marginTop: '-80px', paddingTop: '80px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--page-text, #fafafa)' }}>
            {formatValue(value)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--page-text, #a3a3a3)' }}>
            {label}
          </div>
        </div>
      </div>
    );
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
    gap: '32px',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div ref={containerRef} style={gridStyle} className="animated-stats-component" role="group" aria-label="Statistics">
      {stats.map((stat: any, index: number) => {
        if (animationType === 'progressRing') {
          return <ProgressRing key={index} value={stat.value} label={stat.label} max={stat.max} />;
        }
        return <CountUp key={index} target={stat.value} label={stat.label} />;
      })}
    </div>
  );
}
