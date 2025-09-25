import React from 'react';

function SkillCircle({ level, maxLevel, size = 80 }) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (level / maxLevel) * circumference;
  const remaining = circumference - progress;

  // Calculate glow intensity based on level
  const glowIntensity = level / maxLevel;
  const glowColor = level > 0 ? getSkillColor(level, maxLevel) : '#333';

  return (
    <div className="skill-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="skill-circle-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="4"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={glowColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${remaining}`}
          strokeDashoffset="0"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="skill-progress-circle"
          style={{
            filter: level > 0 ? `drop-shadow(0 0 ${4 + glowIntensity * 8}px ${glowColor})` : 'none',
            transition: 'all 0.3s ease'
          }}
        />
        
        {/* Inner glow effect for higher levels */}
        {level > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - 8}
            fill={glowColor}
            opacity={glowIntensity * 0.1}
            className="skill-inner-glow"
          />
        )}
        
        {/* Skill rank indicators (dots around the circle) */}
        {Array.from({ length: maxLevel }, (_, i) => {
          const angle = (i / maxLevel) * 360 - 90;
          const dotRadius = 3;
          const dotDistance = radius + 8;
          const x = size / 2 + Math.cos(angle * Math.PI / 180) * dotDistance;
          const y = size / 2 + Math.sin(angle * Math.PI / 180) * dotDistance;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={dotRadius}
              fill={i < level ? glowColor : '#444'}
              className="skill-rank-dot"
              style={{
                filter: i < level ? `drop-shadow(0 0 4px ${glowColor})` : 'none'
              }}
            />
          );
        })}
      </svg>
      
      {/* Mastery indicator for max level */}
      {level === maxLevel && (
        <div className="mastery-indicator">
          <span className="mastery-icon">★</span>
        </div>
      )}
    </div>
  );
}

function getSkillColor(level, maxLevel) {
  const progress = level / maxLevel;
  
  if (progress <= 0.3) {
    // Beginner: Blue to Cyan
    return `hsl(${200 + progress * 100}, 80%, 60%)`;
  } else if (progress <= 0.6) {
    // Intermediate: Cyan to Green
    return `hsl(${180 - (progress - 0.3) * 60}, 80%, 60%)`;
  } else if (progress <= 0.9) {
    // Advanced: Green to Orange
    return `hsl(${120 - (progress - 0.6) * 80}, 80%, 60%)`;
  } else {
    // Master: Orange to Gold
    return `hsl(${40 + (progress - 0.9) * 20}, 90%, 70%)`;
  }
}

export default SkillCircle;
