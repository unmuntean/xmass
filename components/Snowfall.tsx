import React, { useMemo } from 'react';

/**
 * Elegant, subtle snow overlay.
 * 
 * Refined for a magical, high-end feel with natural falling patterns.
 */
export const Snowfall: React.FC = () => {
  // Reduce flakes on mobile for better performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const flakeCount = isMobile ? 30 : 60;
  
  const flakes = useMemo(() => {
    return [...Array(flakeCount)].map((_, i) => {
      const depth = Math.random(); // 0 = far, 1 = close
      const size = 1 + (depth * 2.5); // Smaller: 1px to 3.5px
      
      return {
        id: i,
        left: Math.random() * 100,
        // Much slower, more varied
        animationDuration: 20 + Math.random() * 25 + (1 - depth) * 15, 
        animationDelay: -Math.random() * 50,
        // Very subtle opacity
        opacity: 0.15 + (depth * 0.25), // Range: 0.15 to 0.4
        size: size,
        blur: 0.3 + (1 - depth) * 1.2,
        // Gentle horizontal drift
        drift: (Math.random() - 0.5) * 80
      };
    });
  }, [flakeCount]);

  const keyframes = `
    @keyframes elegantSnow {
      0% {
        transform: translate3d(0, -20vh, 0) scale(0);
        opacity: 0;
      }
      10% {
        opacity: var(--target-opacity);
        transform: translate3d(0, 0, 0) scale(1);
      }
      90% {
        opacity: var(--target-opacity);
      }
      100% {
        transform: translate3d(var(--drift), 120vh, 0) scale(0.8);
        opacity: 0;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 9999 }}
      >
        {flakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: 0,
              filter: `blur(${flake.blur}px)`,
              
              '--target-opacity': flake.opacity,
              '--drift': `${flake.drift}px`,
              
              animation: `elegantSnow ${flake.animationDuration}s ease-in-out infinite`,
              animationDelay: `${flake.animationDelay}s`,
              top: '-20px',
              mixBlendMode: 'screen',
              willChange: 'transform, opacity'
            } as React.CSSProperties} 
          />
        ))}
      </div>
    </>
  );
};
