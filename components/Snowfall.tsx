import React, { useMemo } from 'react';

type SnowMood = 'calm' | 'blizzard';

interface SnowfallProps {
  mood: SnowMood;
}

/**
 * Global snow overlay.
 *
 * - "calm": subtle, slow flakes (used during gameplay or neutral states)
 * - "blizzard": denser, faster flakes for dramatic moments (menu, tutorial, game over)
 */
export const Snowfall: React.FC<SnowfallProps> = ({ mood }) => {
  // Reduce base flakes on mobile for better performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const baseCount = isMobile ? 25 : 60;

  const flakeCount =
    mood === 'blizzard'
      ? Math.min(isMobile ? 80 : 160, Math.round(baseCount * (isMobile ? 2.4 : 2.8))) // strong boost but capped
      : baseCount;
  
  const flakes = useMemo(() => {
    return [...Array(flakeCount)].map((_, i) => {
      const depth = Math.random(); // 0 = far, 1 = close
      const size = 1 + depth * 2.5; // 1px to 3.5px

      // Calm vs blizzard tuning
      // Keep fall speed similar, but make horizontal movement much wilder in blizzard
      const durationBase = mood === 'blizzard' ? 20 : 22;
      const durationRange = mood === 'blizzard' ? 18 : 24;
      const opacityBase = mood === 'blizzard' ? 0.22 : 0.12;
      const opacityExtra = mood === 'blizzard' ? 0.28 : 0.22;
      const driftMultiplier = mood === 'blizzard' ? 4 : 1;
      
      const gust = (Math.random() - 0.5) * 60 * (mood === 'blizzard' ? 4 : 0.8); // extra push from gusts

      return {
        id: i,
        left: Math.random() * 100,
        // Slightly faster and more varied for blizzard
        animationDuration: durationBase + Math.random() * durationRange + (1 - depth) * 12,
        animationDelay: -Math.random() * 50,
        // Subtle opacity, a bit stronger in blizzard
        opacity: opacityBase + depth * opacityExtra,
        size: size,
        blur: 0.3 + (1 - depth) * 1.2,
        // Base horizontal drift – stronger in blizzard
        drift: (Math.random() - 0.5) * 80 * driftMultiplier,
        // Gust component for more chaotic blizzard
        gust,
      };
    });
  }, [flakeCount, mood]);

  const keyframes = `
    @keyframes elegantSnow {
      0% {
        transform: translate3d(0, -20vh, 0) scale(0);
        opacity: 0;
      }
      15% {
        opacity: var(--target-opacity);
        transform: translate3d(0, 0, 0) scale(1);
      }
      50% {
        /* Mid‑air, strong cross‑wind pushes flakes sideways */
        transform: translate3d(
          calc(var(--drift) * 0.7 + var(--gust) * 1.2),
          55vh,
          0
        ) scale(1);
        opacity: var(--target-opacity);
      }
      80% {
        transform: translate3d(
          calc(var(--drift) * 1.1 + var(--gust) * 1.8),
          105vh,
          0
        ) scale(0.9);
        opacity: var(--target-opacity);
      }
      100% {
        transform: translate3d(
          calc(var(--drift) * 1.4 + var(--gust) * 2.4),
          125vh,
          0
        ) scale(0.8);
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
              '--gust': `${flake.gust}px`,
              
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
