import React, { useMemo } from 'react';

interface ZeigarnikRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  trackOpacity?: number;
  startAngleDeg?: number;
}

export const ZeigarnikRing: React.FC<ZeigarnikRingProps> = ({
  progress,
  size = 22,
  strokeWidth = 2,
  color = 'currentColor',
  className,
  style,
  trackOpacity = 0.18,
  startAngleDeg = -90
}) => {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));

  const { r, c, dashOffset } = useMemo(() => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - p);
    return { r: radius, c: circumference, dashOffset: offset };
  }, [p, size, strokeWidth]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g transform={`rotate(${startAngleDeg} ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={trackOpacity}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </g>
    </svg>
  );
};
