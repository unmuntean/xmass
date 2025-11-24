
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const YouTubeBackground: React.FC = () => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // 2. Initialize Player
    const initPlayer = () => {
      if (!window.YT || !containerRef.current) return;

      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: 'UK8BGACbzKc', // Jingle Bell Rock
          playerVars: {
            'autoplay': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'loop': 1,
            'modestbranding': 1,
            'playsinline': 1,
            'rel': 0,
            'showinfo': 0,
            'enablejsapi': 1,
            'origin': window.location.origin, // Critical for some browser security policies
            'playlist': 'UK8BGACbzKc' // Required for looping single video
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      } catch (e) {
        console.error("YouTube Player Init Error", e);
      }
    };

    // 3. Handle API Ready Global Callback
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
       // We prefer not to destroy the player to keep music seamless, 
       // but react strict mode might trigger double mount.
    };
  }, []);

  const onPlayerReady = (event: any) => {
    event.target.setVolume(20); // Set moderate volume
    event.target.playVideo();
  };

  const onPlayerStateChange = (event: any) => {
      // Ensure it loops if it somehow stops
      if (event.data === window.YT.PlayerState.ENDED) {
          event.target.playVideo();
      }
  };

  // 4. Global Unlock Listener
  // Browsers block audio autoplay until user interaction.
  useEffect(() => {
    const unlockAudio = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    };

    // Listen to multiple interaction types to catch the first user gesture
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden z-[-1] invisible">
      <div ref={containerRef}></div>
    </div>
  );
};
