import React, { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './StarBorder.module.css';

export interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: ReactNode;
  to?: string;
  [key: string]: any;
}

export default function StarBorder({
  as: Component = Link,
  className = '',
  color = '#22d3ee',
  speed = '4s',
  children,
  to,
  ...props
}: StarBorderProps) {
  return (
    <Component
      to={to}
      className={clsx(styles.starBorderContainer, className)}
      style={{
        '--star-color': color,
        '--star-speed': speed,
      } as React.CSSProperties}
      {...props}
    >
      {/* 旋转流光背景 */}
      <div className={styles.conicGlow} />
      <div className={styles.conicGlowReverse} />
      {/* 内部按钮内容 */}
      <div className={styles.innerContent}>{children}</div>
    </Component>
  );
}
