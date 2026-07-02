import React, { useRef, useState, ReactNode, MouseEvent } from 'react';
import clsx from 'clsx';
import styles from './TiltCard.module.css';

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
}

export default function TiltCard({
  children,
  className = '',
  maxTilt = 6,
  glareOpacity = 0.2,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0, transform: 'translate(-50%, -50%)' });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateY = ((mouseX - width / 2) / (width / 2)) * maxTilt;
    const rotateX = -((mouseY - height / 2) / (height / 2)) * maxTilt;

    setTransformStyle(`perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);

    // 计算高光位置
    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;
    setGlareStyle({
      opacity: glareOpacity,
      transform: `translate(${glareX}%, ${glareY}%)`,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(styles.tiltContainer, { [styles.hovered]: isHovered }, className)}
      style={{ transform: transformStyle }}
    >
      <div className={styles.tiltContent}>{children}</div>
      {/* 随动高光层 */}
      <div
        className={styles.glareOverlay}
        style={{
          opacity: glareStyle.opacity,
          background: `radial-gradient(circle at ${glareStyle.transform.replace('translate(', '').replace(')', '')}, rgba(255, 255, 255, 0.4), transparent 60%)`,
        }}
      />
    </div>
  );
}
