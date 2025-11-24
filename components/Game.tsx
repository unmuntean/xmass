
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CampaignData, Product, Category, GameStats, CollectedItem } from '../types';
import { CATEGORY_CONFIG, VOUCHER_PRODUCT, POWERUP_HEART, POWERUP_CLOCK } from '../constants';
import { ProductCard } from './ProductCard';
import { imagePreloader } from '../services/imagePreloader';
import coinsSound from '../media/coins.wav';
import missSound from '../media/miss.wav';
import voucherSound from '../media/voucher.mp3';


interface GameProps {
  campaignData: CampaignData;
  onGameOver: (stats: GameStats) => void;
  onExit: () => void;
  globalMuted: boolean;
  setGlobalMuted: (muted: boolean) => void;
}

// Game Balance Constants
const STARTING_SPEED = 0.20; 
const MAX_SPEED = 0.85; 
const STARTING_SPAWN_RATE = 1400; 
const MIN_SPAWN_RATE = 500; 
const LIFE_LOST_Y = 115; 

interface ActiveItem {
  id: number;
  product: Product;
  x: number;
  y: number;
  xBase: number;
  yBase: number;
  phaseOffset: number; 
  rotation: number;
  rotationSpeed: number;
  state: 'falling' | 'flying_to_cart' | 'missed';
  targetCartX?: number;
  targetCartY?: number;
}

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  content: string | React.ReactNode;
  type: 'text' | 'particle' | 'emoji';
  color?: string;
  velocity?: { x: number, y: number };
}

export const Game: React.FC<GameProps> = ({ campaignData, onGameOver, onExit, globalMuted, setGlobalMuted }) => {
  // -- RENDER STATE --
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);
  const [visualTargetId, setVisualTargetId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  
  // -- FX STATE --
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  // Use global mute state from App
  const isMuted = globalMuted;
  
  const [bagFills, setBagFills] = useState<{[key in Category]: number}>({
    [Category.NAILS]: 0,
    [Category.MAKEUP]: 0,
    [Category.ACCESSORIES]: 0
  });
  const [bagBump, setBagBump] = useState<Category | null>(null);
  
  // VOUCHER GLOW STATE
  const [voucherGlow, setVoucherGlow] = useState<Category | null>(null);
  
  // POWER-UP STATE
  const [slowdownActive, setSlowdownActive] = useState(false);
  const slowdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // -- ENGINE REFS --
  const itemsRef = useRef<ActiveItem[]>([]);
  const lockedTargetIdRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const levelRef = useRef(1);
  const voucherSpawnedRef = useRef(false);

  const collectedRef = useRef<{[key in Category]: number}>({
    [Category.NAILS]: 0,
    [Category.MAKEUP]: 0,
    [Category.ACCESSORIES]: 0
  });
  
  const collectedItemsMapRef = useRef<Map<string, CollectedItem>>(new Map());
  const cartRefs = useRef<{[key in Category]?: HTMLDivElement | null}>({});
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);

  // -- AUDIO REFS --
  const sfxPopRef = useRef<HTMLAudioElement | null>(null);
  const sfxErrorRef = useRef<HTMLAudioElement | null>(null);
  const sfxLevelUpRef = useRef<HTMLAudioElement | null>(null);
  const sfxVoucherRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    sfxPopRef.current = new Audio(coinsSound); // Coins sound for success
    sfxPopRef.current.volume = 1.0; // Double volume (was 0.6, now max)

    // Short, Dull "Wood Block" - distinct for error, non-musical
    sfxErrorRef.current = new Audio(missSound); // Miss sound for error
    sfxErrorRef.current.volume = 0.7;
    
    sfxLevelUpRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/11/22/audio_40478147d3.mp3?filename=magic-wand-6009.mp3"); // Magic chimes
    sfxLevelUpRef.current.volume = 0.6;
    
    sfxVoucherRef.current = new Audio(voucherSound);
    sfxVoucherRef.current.volume = 0.8;
  }, []);

  useEffect(() => {
    if (sfxPopRef.current) sfxPopRef.current.muted = isMuted;
    if (sfxErrorRef.current) sfxErrorRef.current.muted = isMuted;
    if (sfxLevelUpRef.current) sfxLevelUpRef.current.muted = isMuted;
    if (sfxVoucherRef.current) sfxVoucherRef.current.muted = isMuted;
  }, [isMuted]);

  const playSound = (type: 'pop' | 'error' | 'level' | 'voucher') => {
      if (isMuted) return;
      const audio = type === 'pop' ? sfxPopRef.current : 
                    type === 'error' ? sfxErrorRef.current : 
                    type === 'voucher' ? sfxVoucherRef.current :
                    sfxLevelUpRef.current;
      if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
      }
  };

  const spawnFloating = (x: number, y: number, content: string | React.ReactNode, type: 'text' | 'particle' | 'emoji' = 'text', color?: string) => {
    const isMobile = window.innerWidth < 768;
    // Reduce particle count on mobile for performance
    if (isMobile && floatingElements.length > 2) return;

    const id = Date.now() + Math.random();
    const velocity = type === 'particle' 
      ? { x: (Math.random() - 0.5) * 15, y: (Math.random() - 1) * 15 } 
      : { x: 0, y: -3 };

    setFloatingElements(prev => [...prev, { id, x, y, content, type, color, velocity }]);
    
    setTimeout(() => {
      setFloatingElements(prev => prev.filter(p => p.id !== id));
    }, type === 'particle' ? 600 : 1000); 
  };

  const triggerConfetti = (x: number, y: number, isVoucher = false) => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 3 : 15; 
    const colors = isVoucher 
        ? ['bg-yellow-300', 'bg-yellow-500', 'bg-white'] 
        : ['bg-red-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-white'];
    
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      spawnFloating(x, y, <div className={`w-2 h-2 rounded-full ${color} ${isVoucher ? 'shadow-[0_0_10px_gold]' : ''}`} />, 'particle');
    }
  };

  const triggerScreenShake = () => {
    if (window.innerWidth < 768) return;
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  const pickNextTarget = (items: ActiveItem[]): number | null => {
      const candidates = items.filter(i => i.state === 'falling');
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => b.y - a.y);
      return candidates[0].id;
  };

  const handleSort = useCallback((category: Category) => {
    if (livesRef.current <= 0) return;

    const currentItems = itemsRef.current;
    let targetId = lockedTargetIdRef.current;
    let targetItem = targetId ? currentItems.find(i => i.id === targetId) : null;

    if (!targetItem || targetItem.state !== 'falling') {
        const bestId = pickNextTarget(currentItems);
        if (bestId) {
            targetId = bestId;
            targetItem = currentItems.find(i => i.id === bestId)!;
            lockedTargetIdRef.current = bestId;
        }
    }
    
    if (!targetItem || targetItem.state !== 'falling') return;

    const isVoucher = targetItem.product.specialType === 'VOUCHER';
    const isHeart = targetItem.product.specialType === 'HEART';
    const isClock = targetItem.product.specialType === 'CLOCK';
    const isPowerup = isHeart || isClock;
    const isCorrect = isVoucher || isPowerup || targetItem.product.category === category;
    
    if (isCorrect) {
        // Handle Heart Power-up
        if (isHeart) {
            playSound('voucher');
            livesRef.current = Math.min(livesRef.current + 1, 3); // Cap at 3 lives
            setLives(livesRef.current);
            spawnFloating(targetItem.x, targetItem.y, "+1 VIAȚĂ!", "text", "text-pink-300 font-black text-4xl drop-shadow-[0_0_20px_rgba(255,0,102,0.8)]");
            triggerConfetti(targetItem.x, targetItem.y, true);
        }
        // Handle Clock Power-up
        else if (isClock) {
            playSound('voucher');
            setSlowdownActive(true);
            spawnFloating(targetItem.x, targetItem.y, "SLOW TIME!", "text", "text-blue-300 font-black text-3xl drop-shadow-[0_0_20px_rgba(79,70,229,0.8)]");
            triggerConfetti(targetItem.x, targetItem.y, true);
            
            // Clear any existing timeout
            if (slowdownTimeoutRef.current) {
                clearTimeout(slowdownTimeoutRef.current);
            }
            
            // Set 2-second slowdown
            slowdownTimeoutRef.current = setTimeout(() => {
                setSlowdownActive(false);
                slowdownTimeoutRef.current = null;
            }, 2000);
        }
        // Handle Voucher
        else if (isVoucher) {
            playSound('voucher');
            spawnFloating(targetItem.x, targetItem.y, "CUPON!", "text", "text-yellow-300 font-black text-4xl drop-shadow-[0_0_20px_gold]");
            setVoucherGlow(category);
            setTimeout(() => setVoucherGlow(null), 1000);
        } 
        // Handle Regular Products
        else {
            playSound('pop');
        }
        
        // Power-ups don't count toward streak, score, or collection
        if (!isPowerup) {
            streakRef.current += 1;
            if (streakRef.current > bestStreakRef.current) bestStreakRef.current = streakRef.current;
            setStreak(streakRef.current);
            
            collectedRef.current[category] += 1;
            const currentMap = collectedItemsMapRef.current;
            const existing = currentMap.get(targetItem.product.id);
            if (existing) {
                existing.count += 1;
            } else {
                currentMap.set(targetItem.product.id, { product: targetItem.product, count: 1 });
            }

            if (streakRef.current % 10 === 0) {
                levelRef.current += 1;
                setLevel(levelRef.current);
                playSound('level');
                spawnFloating(50, 40, `NIVEL UP!`, "text", "text-yellow-200 text-4xl font-serif font-black drop-shadow-lg");
                triggerScreenShake();
            }

            const multiplier = 1 + (streakRef.current * 0.1) + (levelRef.current * 0.2);
            const basePoints = isVoucher ? 500 : 100;
            const points = Math.round(basePoints * multiplier);
            scoreRef.current += points;
            setScore(scoreRef.current);

            setBagFills(fills => ({ ...fills, [category]: Math.min(fills[category] + 5, 100) }));
            setBagBump(category);
            setTimeout(() => setBagBump(null), 150);
            
            if (!isVoucher) {
                spawnFloating(targetItem.x, targetItem.y, `+${points}`, "text", "text-yellow-100 font-bold text-2xl stroke-black");
            }
            triggerConfetti(targetItem.x, targetItem.y, isVoucher);
        }

        const cartRect = cartRefs.current[category]?.getBoundingClientRect();
        const gameRect = document.getElementById('game-area')?.getBoundingClientRect();
        let targetX = 50, targetY = 100;
        if (cartRect && gameRect) {
            targetX = ((cartRect.left + cartRect.width/2 - gameRect.left) / gameRect.width) * 100;
            targetY = ((cartRect.top + cartRect.height/3 - gameRect.top) / gameRect.height) * 100;
        }

        itemsRef.current = currentItems.map(i => i.id === targetItem!.id ? {
            ...i,
            state: 'flying_to_cart',
            targetCartX: targetX,
            targetCartY: targetY
        } : i);

    } else {
        playSound('error');
        livesRef.current -= 1;
        setLives(livesRef.current);
        streakRef.current = 0;
        setStreak(0);
        
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        triggerScreenShake();
        spawnFloating(targetItem.x, targetItem.y, "UPS!", "text", "text-red-500 font-black text-3xl");

        itemsRef.current = currentItems.map(i => i.id === targetItem!.id ? { ...i, state: 'missed' } : i);
    }

    const nextTargetId = pickNextTarget(itemsRef.current);
    lockedTargetIdRef.current = nextTargetId;
    setVisualTargetId(nextTargetId);
    setActiveItems([...itemsRef.current]);

  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (livesRef.current <= 0) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') handleSort(Category.NAILS);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'ArrowUp' || e.key === 'w') handleSort(Category.MAKEUP);
      if (e.key === 'ArrowRight' || e.key === 'd') handleSort(Category.ACCESSORIES);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSort]);

  const updateGame = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const currentLevel = levelRef.current;
    const currentSpeed = Math.min(STARTING_SPEED + ((currentLevel - 1) * 0.07), MAX_SPEED); 
    const currentSpawnRate = Math.max(STARTING_SPAWN_RATE - ((currentLevel - 1) * 110), MIN_SPAWN_RATE);

    const fallingCount = itemsRef.current.filter(i => i.state === 'falling').length;
    let effectiveSpawnRate = currentSpawnRate;
    
    // Panic spawn if empty
    if (fallingCount === 0) {
        effectiveSpawnRate = 150; 
    } else if (fallingCount === 1) {
        effectiveSpawnRate = currentSpawnRate * 0.6; 
    }

    if (time - lastSpawnTimeRef.current > effectiveSpawnRate) {
      if (fallingCount < 5 + Math.floor(currentLevel / 2)) {
        let productToSpawn = campaignData.products[Math.floor(Math.random() * campaignData.products.length)];
        
        // Power-up spawning logic
        // Heart spawns at levels 3, 6, 9, 12, etc.
        // Clock spawns at levels 2, 4, 6, 8, 10, 12, etc.
        const shouldSpawnHeart = currentLevel % 3 === 0 && Math.random() < 0.15;
        const shouldSpawnClock = currentLevel % 2 === 0 && Math.random() < 0.12;
        
        if (shouldSpawnHeart) {
          productToSpawn = POWERUP_HEART;
        } else if (shouldSpawnClock) {
          productToSpawn = POWERUP_CLOCK;
        } else if (!voucherSpawnedRef.current && scoreRef.current > 150) {
            productToSpawn = VOUCHER_PRODUCT;
            voucherSpawnedRef.current = true;
        } else if (voucherSpawnedRef.current && Math.random() < 0.01) {
             productToSpawn = VOUCHER_PRODUCT;
        }

        // Spawn across wider horizontal range with better distribution
        const startX = 15 + Math.random() * 70; 

        const newItem: ActiveItem = {
          id: time + Math.random(),
          product: productToSpawn,
          x: startX,
          y: -15, // Start higher to be fully off-screen
          xBase: startX,
          yBase: -15,
          phaseOffset: Math.random() * Math.PI * 2,
          rotation: 0, 
          rotationSpeed: 0, 
          state: 'falling'
        };
        
        itemsRef.current.push(newItem);
        lastSpawnTimeRef.current = time;
      }
    }

    let lifeLost = false;
    const nextItems: ActiveItem[] = [];

    itemsRef.current.forEach(item => {
        if (item.state === 'flying_to_cart' && item.targetCartX !== undefined) {
            const dx = item.targetCartX - item.x;
            const dy = item.targetCartY! - item.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 4) return; 

            const flySpeed = 3.8 * (deltaTime / 16); 
            nextItems.push({
                ...item,
                x: item.x + (dx / dist) * flySpeed * 2,
                y: item.y + (dy / dist) * flySpeed * 2,
                rotation: item.rotation + 20,
            });
            return;
        }

        if (item.state === 'missed') {
            if (item.y > 150) return; 
            nextItems.push({
                ...item,
                y: item.y + (1.2 * (deltaTime / 16)),
                rotation: item.rotation - 5,
                x: item.x + Math.sin(time / 50) * 2.0 
            });
            return;
        }

        const speedMultiplier = 1 + (streakRef.current > 5 ? 0.1 : 0);
        const slowdownMultiplier = slowdownActive ? 0.4 : 1; // 60% slower when power-up is active
        const moveSpeed = currentSpeed * speedMultiplier * slowdownMultiplier * (deltaTime / 16);
        const nextYBase = item.yBase + moveSpeed;
        const swayAmount = 6 * Math.sin((nextYBase / 22) + item.phaseOffset); 
        const nextX = item.xBase + swayAmount;
        
        if (nextYBase > LIFE_LOST_Y) {
          lifeLost = true;
          if (lockedTargetIdRef.current === item.id) {
              lockedTargetIdRef.current = null;
          }
          spawnFloating(item.x, 90, "RATAT", "text", "text-red-500 font-bold");
        } else {
            nextItems.push({ 
                ...item, 
                y: nextYBase, 
                yBase: nextYBase, 
                x: nextX,
                rotation: item.rotation + item.rotationSpeed
            });
        }
    });

    itemsRef.current = nextItems;

    const currentLockedItem = itemsRef.current.find(i => i.id === lockedTargetIdRef.current && i.state === 'falling');
    
    if (!currentLockedItem) {
        const bestId = pickNextTarget(itemsRef.current);
        lockedTargetIdRef.current = bestId; 
    }

    if (lifeLost) {
        playSound('error');
        livesRef.current -= 1;
        setLives(livesRef.current);
        streakRef.current = 0;
        setStreak(0);
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        triggerScreenShake();
    }

    // Throttle floating elements update - only every 3rd frame on mobile
    const isMobile = window.innerWidth < 768;
    const shouldUpdateFloating = !isMobile || (time % 3 === 0);
    
    if (shouldUpdateFloating && floatingElements.length > 0) {
      setFloatingElements(prev => prev.map(el => {
          if (el.velocity) {
              return {
                  ...el,
                  x: el.x + (el.velocity.x * 0.15),
                  y: el.y + (el.velocity.y * 0.15)
              };
          }
          return el;
      }));
    }

    setActiveItems([...itemsRef.current]);
    setVisualTargetId(lockedTargetIdRef.current); 

    if (livesRef.current > 0) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  };

  // Preload all images on mount for smooth gameplay
  useEffect(() => {
    imagePreloader.preloadProducts(campaignData.products);
  }, [campaignData.products]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [campaignData]);

  useEffect(() => {
    if (lives <= 0) {
        const collectedItemsList = Array.from(collectedItemsMapRef.current.values())
            .sort((a: CollectedItem, b: CollectedItem) => b.count - a.count); 

        onGameOver({
            finalScore: scoreRef.current,
            collected: collectedRef.current,
            bestStreak: bestStreakRef.current,
            collectedItems: collectedItemsList
        });
    }
  }, [lives, onGameOver]);

  return (
    <div id="game-area" className={`relative w-full h-full flex flex-col overflow-hidden bg-black ${screenShake ? 'animate-shake' : ''}`}>
      
      <div className={`absolute inset-0 bg-red-600 pointer-events-none z-50 transition-opacity duration-100 ${damageFlash ? 'opacity-40' : 'opacity-0'}`}></div>

      {/* PREMIUM WINTER BACKGROUND - Optimized for mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#3c0e14]">
         {/* Disable blur on mobile, keep on desktop */}
         <div className="absolute w-[120vw] h-[120vw] rounded-full bg-red-900/40 md:blur-[120px] top-[-50%] left-[-20%] animate-pulse" style={{animationDuration: '6s', willChange: 'opacity'}}></div>
         <div className="absolute w-[100vw] h-[100vw] rounded-full bg-yellow-900/20 md:blur-[100px] bottom-[-40%] right-[-20%] animate-pulse" style={{animationDuration: '8s', willChange: 'opacity'}}></div>
         <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#1a0505] to-transparent pointer-events-none"></div>
      </div>
      
      {/* Level number - Smaller and no blur on mobile */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] md:opacity-[0.04] pointer-events-none z-0 select-none overflow-hidden">
         <span className="text-[30vh] md:text-[40vh] font-serif font-black tracking-tighter text-white md:blur-sm italic">{level}</span>
      </div>

      <div className="absolute inset-0 z-30 flex w-full h-full touch-manipulation" style={{ touchAction: 'none' }}>
         <div className="flex-1 h-full active:bg-white/5 transition-colors duration-75 border-r border-white/5" onPointerDown={(e) => { e.preventDefault(); handleSort(Category.NAILS); }}></div>
         <div className="flex-1 h-full active:bg-white/5 transition-colors duration-75 border-r border-white/5" onPointerDown={(e) => { e.preventDefault(); handleSort(Category.MAKEUP); }}></div>
         <div className="flex-1 h-full active:bg-white/5 transition-colors duration-75" onPointerDown={(e) => { e.preventDefault(); handleSort(Category.ACCESSORIES); }}></div>
      </div>

      {/* HUD - Optimized backdrop-blur for mobile */}
      <div className="absolute top-0 left-0 w-full p-2 md:p-4 flex justify-between items-start z-40 pointer-events-none">
        <div className="flex flex-col gap-1 md:gap-2 origin-top-left transform scale-75 md:scale-100">
             <div className="bg-black/70 md:bg-black/60 md:backdrop-blur-md px-4 py-2 md:px-5 md:py-3 rounded-r-2xl border-l-4 border-yellow-500 flex flex-col shadow-lg border-y border-r border-white/10">
                <span className="text-[8px] md:text-[10px] text-yellow-500 uppercase tracking-widest font-bold">SCOR</span>
                <span className="text-2xl md:text-3xl font-black font-mono leading-none text-white tracking-tighter drop-shadow-md">
                    {score.toLocaleString()}
                </span>
             </div>
             <div className={`transition-all duration-300 origin-left ${streak > 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                 <div className="text-yellow-300 font-serif italic text-xl md:text-2xl drop-shadow-md ml-2 animate-pulse">
                     {streak}x COMBO
                 </div>
             </div>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto origin-top-right transform scale-75 md:scale-100">
            {/* Lives */}
            <div className="bg-black/70 md:bg-black/60 md:backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-l-2xl flex gap-1 shadow-lg pointer-events-none border-r-4 border-red-500 border-y border-l border-white/10">
                {[...Array(3)].map((_, i) => (
                    <span key={i} className={`text-xl md:text-2xl transition-all duration-300 ${i < lives ? 'scale-100 opacity-100 drop-shadow-md' : 'scale-75 opacity-20 grayscale'}`}>
                        ❤️
                    </span>
                ))}
            </div>

            {/* Level */}
            <div className="bg-white/15 md:bg-white/10 md:backdrop-blur-md px-3 py-0.5 md:px-4 md:py-1 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                 <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-200">Nivel {level}</span>
            </div>

             {/* Sound Toggle - Moved to bottom */}
             <button 
                onClick={() => setGlobalMuted(!isMuted)}
                className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-colors border border-white/10 mt-1"
             >
                {isMuted ? '🔇' : '🔊'}
             </button>

             {/* Slowdown Active Indicator */}
             {slowdownActive && (
                 <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 rounded-l-2xl backdrop-blur-md border-r-4 border-blue-300 shadow-[0_0_20px_rgba(79,70,229,0.6)] animate-pulse pointer-events-none">
                     <div className="flex items-center gap-1.5">
                         <span className="text-xl">⏰</span>
                         <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-white">SLOW</span>
                     </div>
                 </div>
             )}
        </div>
      </div>

      {/* Play Area */}
      <div className="flex-grow relative z-20 perspective-1000 pointer-events-none">
        {activeItems.map(item => (
            <ProductCard 
                key={item.id} 
                product={item.product} 
                xPosition={item.x} 
                yPosition={item.y}
                rotation={item.rotation}
                feedback={item.state === 'flying_to_cart' ? 'success' : item.state === 'missed' ? 'failure' : null}
                isTarget={item.id === visualTargetId}
            />
        ))}

        {floatingElements.map(el => (
            <div 
                key={el.id}
                className={`absolute font-black pointer-events-none whitespace-nowrap
                    ${el.type === 'text' ? 'text-3xl animate-[float-up_0.8s_ease-out_forwards]' : ''}
                    ${el.type === 'particle' ? 'animate-[pop-in_0.6s_ease-out_forwards]' : ''}
                    ${el.type === 'emoji' ? 'text-2xl animate-[float-up_1s_ease-out_forwards]' : ''}
                    ${el.color || 'text-white'} z-[200]`}
                style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translateX(-50%)' }}
            >
                {el.content}
            </div>
        ))}
      </div>

      {/* Bottom Bags */}
      <div className="relative z-20 flex pb-safe px-2 gap-3 items-end mb-4 justify-center h-40 pointer-events-none">
        {[Category.NAILS, Category.MAKEUP, Category.ACCESSORIES].map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const fillPercent = bagFills[cat];
            const isBumping = bagBump === cat;
            const isVoucherGlow = voucherGlow === cat;
            
            return (
                <div 
                    key={cat}
                    ref={(el) => { cartRefs.current[cat] = el; }}
                    className={`relative flex-1 max-w-[120px] h-full flex flex-col justify-end transition-transform duration-100 group ${isBumping ? 'scale-105 -translate-y-1' : 'scale-100'}`}
                >
                    {/* VOUCHER BEAM EFFECT */}
                    {isVoucherGlow && (
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-yellow-300/50 to-transparent blur-xl z-0 animate-[beam_1s_ease-out_forwards]"></div>
                    )}

                    {/* VOUCHER GLOW */}
                    {isVoucherGlow && (
                        <div className="absolute inset-0 bg-yellow-400 rounded-xl blur-xl opacity-80 animate-ping z-0"></div>
                    )}

                    {/* 3D BAG HANDLE */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-12 border-4 border-yellow-600/60 rounded-t-full -z-10 transform -translate-y-4"></div>

                    {/* BAG BODY */}
                    <div className={`w-full h-full rounded-sm border-2 ${config.borderColor} bg-gradient-to-b from-gray-900 to-black overflow-hidden flex flex-col relative shadow-2xl z-10 ${isVoucherGlow ? 'border-yellow-300 ring-4 ring-yellow-400/50' : ''}`}>
                         {/* Texture Overlay */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay"></div>
                        
                        <div 
                           className={`absolute bottom-0 left-0 w-full transition-all duration-300 ease-out ${config.color} opacity-60`}
                           style={{ height: `${fillPercent}%` }}
                        />
                        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1 pt-4">
                            <span className="text-4xl filter drop-shadow-lg transform transition-transform group-hover:scale-110">
                                {config.icon}
                            </span>
                            <span className={`text-[9px] font-serif font-bold uppercase tracking-widest ${config.textColor} bg-black/60 px-3 py-1 rounded-sm border border-white/10 shadow-lg`}>
                                {config.label}
                            </span>
                        </div>
                        {isBumping && (
                            <div className={`absolute inset-0 ${config.color} opacity-30 mix-blend-overlay`}></div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
