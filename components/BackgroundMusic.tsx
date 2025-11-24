import React, { useEffect, useRef } from 'react';
import soundtrack from '../media/soundtrack.mp3';

interface BackgroundMusicProps {
  muted?: boolean;
}

/**
 * Plays a looping background soundtrack from the local `media/soundtrack.mp3`.
 * 
 * - Uses an <audio> element for better React lifecycle management.
 * - Audio is started on the **first user interaction** to comply with browser autoplay policies.
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ muted = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const unlockedRef = useRef(false);

  // Handle mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current || unlockedRef.current) return;
      
      // Try to play
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            unlockedRef.current = true;
            // Remove listeners once successfully playing
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
          })
          .catch((error) => {
            console.log("Autoplay prevented, waiting for interaction...");
          });
      }
    };

    // Attempt to play immediately (might work if user already interacted with page)
    unlock();

    // Add listeners for first interaction
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    document.addEventListener('keydown', unlock);

    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <audio 
      ref={audioRef} 
      src={soundtrack} 
      loop 
      preload="auto"
      style={{ display: 'none' }} 
    />
  );
};
