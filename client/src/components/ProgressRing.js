import React from 'react';

function ProgressRing({ progress, color, size = 100, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      className="progress-ring"
      width={size}
      height={size}
    >
      {/* Background circle */}
      <circle
        stroke="var(--bg-surface-light)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress circle */}
      <circle
        className="progress-ring-circle"
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Percentage text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fill="var(--text-primary)"
        fontSize={size * 0.2}
        fontWeight="600"
        fontFamily="'Space Grotesk', sans-serif"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

export default ProgressRing;

