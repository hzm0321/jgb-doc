import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './AnimatedCounter.module.css';

export interface AnimatedCounterProps {
  value: string;
  label: string;
  className?: string;
  delay?: number;
}

export default function AnimatedCounter({
  value,
  label,
  className = '',
  delay = 0,
}: AnimatedCounterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // 检查是否包含数字，支持类似 "15+" 的格式
    const match = value.match(/^(\d+)(.*)$/);
    if (!match) {
      // 纯文本，直接带动画展示
      setDisplayValue(value);
      return;
    }

    const targetNum = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 1200; // 毫秒
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      // 缓动算法 (Ease Out Quad)
      const easeOut = 1 - (1 - progress) * (1 - progress);
      const currentNum = Math.round(targetNum * easeOut);

      setDisplayValue(`${currentNum}${suffix}`);

      if (currentFrame >= totalFrames) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={containerRef}
      className={clsx(styles.counterContainer, { [styles.visible]: isVisible }, className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className={styles.valueText}>{displayValue}</span>
      <span className={styles.labelText}>{label}</span>
    </div>
  );
}
