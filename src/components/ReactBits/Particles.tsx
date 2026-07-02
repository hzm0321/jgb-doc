import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './Particles.module.css';

export interface ParticlesProps {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  mouseInteraction?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function Particles({
  className = '',
  particleCount = 55,
  connectionDistance = 110,
  mouseInteraction = true,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const colors = ['#22d3ee', '#60a5fa', '#a78bfa', '#34d399', '#ffffff'];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 1.8 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 绘制和更新粒子
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // 绘制粒子圆点
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();

        // 连线逻辑 (粒子之间)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / connectionDistance) * 0.25;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // 连线与鼠标互动
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < connectionDistance * 1.3) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = '#22d3ee';
            ctx.globalAlpha = (1 - mDist / (connectionDistance * 1.3)) * 0.4;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, connectionDistance, mouseInteraction]);

  if (!isMounted) return null;

  return (
    <div className={clsx(styles.particlesContainer, className)}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
