import React, { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './ShinyText.module.css';

export interface ShinyTextProps {
  children: ReactNode;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export default function ShinyText({
  children,
  disabled = false,
  speed = 4,
  className = '',
}: ShinyTextProps) {
  return (
    <span
      className={clsx(
        styles.shinyText,
        { [styles.disabled]: disabled },
        className
      )}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {children}
    </span>
  );
}
