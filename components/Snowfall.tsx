
import React, { useMemo } from 'react';

export const Snowfall: React.FC = () => {
  // Memoize flakes to avoid re-calculating on every render
  const flakes = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10, // 5s to 15s
      animationDelay: -Math.random() * 10, // Start instantly
      opacity: 0.3 + Math.random() * 0.5,
      size: 3 + Math.random() * 5
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-white rounded-full blur-[1px]"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.animationDelay}s`,
            top: '-10px'
          }}
        />
      ))}
    </div>
  );
};
