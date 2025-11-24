
import React, { useEffect, useState, useRef } from 'react';
import { GameStats, CollectedItem } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { leaderboardService, LeaderboardEntry } from '../services/leaderboardService';
import { deviceStorage } from '../services/deviceStorage';
import { NameInputModal } from './NameInputModal';
import { LeaderboardModal } from './LeaderboardModal';

interface GameOverScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ stats, onRestart, onMenu }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectedItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Leaderboard state
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [fullLeaderboard, setFullLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [isHighScore, setIsHighScore] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Track initial load
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false); // Track if updating existing score
  const [existingPlayerName, setExistingPlayerName] = useState<string>('');
  const [detailsClickable, setDetailsClickable] = useState(false); // Delay item clicks on Game Over
  
  // Sort items: Vouchers first, then by count descending
  const sortedItems = [...stats.collectedItems].sort((a, b) => {
    const aIsVoucher = a.product.specialType === 'VOUCHER';
    const bIsVoucher = b.product.specialType === 'VOUCHER';
    if (aIsVoucher && !bIsVoucher) return -1;
    if (!aIsVoucher && bIsVoucher) return 1;
    return b.count - a.count;
  });

  // Load leaderboard on mount - check FRESH device storage each time
  useEffect(() => {
    const loadLeaderboard = async () => {
      // Fetch top 3 from server
      const top3 = await leaderboardService.getTopPlayers(3);
      setTopPlayers(top3);
      
      // IMPORTANT: Always get FRESH device storage data
      const deviceScore = deviceStorage.getDeviceScore();
      
      if (deviceScore && deviceScore.highScore && typeof deviceScore.highScore === 'number') {
        // User has already submitted from this device
        if (stats.finalScore > deviceScore.highScore) {
          // New high score for this device - offer update
          setIsUpdateMode(true);
          setExistingPlayerName(deviceScore.playerName || '');
          setIsHighScore(true);
        } else {
          // Lower or equal score - don't show name input
          setIsHighScore(false);
          setIsUpdateMode(false);
        }
      } else {
        // No previous score from this device - check global leaderboard
        const qualifies = await leaderboardService.isHighScore(stats.finalScore);
        setIsHighScore(qualifies);
        setIsUpdateMode(false);
      }
      
      setInitialLoadComplete(true);
    };
    
    loadLeaderboard();
  }, [stats.finalScore]);

  // Small delay before wishlist items become clickable (avoid accidental taps on mobile)
  useEffect(() => {
    setDetailsClickable(false);
    const t = setTimeout(() => setDetailsClickable(true), 1000);
    return () => clearTimeout(t);
  }, [stats.finalScore]);

  // Score counting animation - runs ONCE on mount
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = stats.finalScore / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= stats.finalScore) {
        setDisplayScore(stats.finalScore);
        clearInterval(timer);
        setShowDetails(true);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, stepTime);

    return () => {
        clearInterval(timer);
    };
  }, [stats.finalScore]); // Only re-run if the score itself changes
  
  // Separate effect to show name input after animation completes
  useEffect(() => {
    if (showDetails && isHighScore && initialLoadComplete && !hasSubmittedScore) {
      const timeout = setTimeout(() => setShowNameInput(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [showDetails, isHighScore, initialLoadComplete, hasSubmittedScore]);

  const handleCopyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitScore = async (name: string) => {
    const deviceScore = deviceStorage.getDeviceScore();
    
    // Validate score before submitting (basic client-side check)
    if (!stats.finalScore || stats.finalScore < 0 || !Number.isFinite(stats.finalScore)) {
      setShowNameInput(false);
      return;
    }
    
    if (isUpdateMode && deviceScore && deviceScore.scoreId) {
      // Update existing score
      const success = await leaderboardService.updateScore(deviceScore.scoreId, stats.finalScore);
      
      if (success) {
        // Update device storage with NEW high score
        deviceStorage.saveDeviceScore({
          playerName: name.trim(),
          scoreId: deviceScore.scoreId,
          highScore: stats.finalScore,
          submittedAt: Date.now()
        });
        
        // Refresh BOTH top 3 podium AND full leaderboard
        const top3 = await leaderboardService.getTopPlayers(3);
        setTopPlayers(top3);
        
        // Also refresh full leaderboard if it's open
        if (showFullLeaderboard) {
          const allPlayers = await leaderboardService.getTopPlayers(50);
          setFullLeaderboard(allPlayers);
        }
        
        setHasSubmittedScore(true);
      } else {
        console.error('Update failed!');
      }
    } else {
      // Submit new score
      const result = await leaderboardService.submitScore(name.trim(), stats.finalScore);
      
      if (result.success && result.id) {
        // Save to device storage
        deviceStorage.saveDeviceScore({
          playerName: name.trim(),
          scoreId: result.id,
          highScore: stats.finalScore,
          submittedAt: Date.now()
        });
        
        // Refresh BOTH top 3 podium AND full leaderboard
        const top3 = await leaderboardService.getTopPlayers(3);
        setTopPlayers(top3);
        
        // Also refresh full leaderboard if it's open
        if (showFullLeaderboard) {
          const allPlayers = await leaderboardService.getTopPlayers(50);
          setFullLeaderboard(allPlayers);
        }
        
        setHasSubmittedScore(true);
      } else {
        console.error('Submit failed!');
      }
    }
    setShowNameInput(false);
  };

  const handleViewFullLeaderboard = async () => {
    // Fetch full leaderboard without affecting the initial load state
    const allPlayers = await leaderboardService.getTopPlayers(50);
    setFullLeaderboard(allPlayers);
    setShowFullLeaderboard(true);
  };
  
  const handleCancelNameInput = () => {
    setShowNameInput(false);
    setHasSubmittedScore(true); // Mark as "handled" even if cancelled
  };

  return (
    <div className="h-full w-full flex flex-col items-center relative overflow-hidden bg-[#3c0e14]">
      
      {/* Winter Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4a0e1c_0%,_#1a0505_100%)] pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="flex-shrink-0 w-full flex flex-col items-center pt-6 pb-3 z-10 animate-[float-up_0.5s_ease-out]">
        <h2 className="text-2xl font-serif italic text-yellow-500 mb-1 drop-shadow-md tracking-wide">
           The Season of You
        </h2>
        <span className="text-5xl font-black font-mono text-white drop-shadow-xl tracking-tighter leading-none">
            {displayScore.toLocaleString()}
        </span>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mt-3 mb-3"></div>
        
        {/* Social Share Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={() => {
              const shareText = `Am obținut ${displayScore.toLocaleString()} puncte în The Season of You! 🎄✨`;
              const shareUrl = window.location.href;
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#1664D8] text-white text-xs font-bold rounded-lg shadow-lg transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share on FB
          </button>
          
          <button
            onClick={() => {
              const shareText = `Am obținut ${displayScore.toLocaleString()} puncte în The Season of You! 🎄✨ @cupio.ro`;
              const shareUrl = window.location.href;
              window.open(`https://www.instagram.com/`, '_blank');
              // Note: Instagram doesn't have direct sharing API, opens Instagram
              navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:opacity-90 text-white text-xs font-bold rounded-lg shadow-lg transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Share on Insta
          </button>
        </div>
      </div>

      {/* COMPACT TOP 3 PODIUM */}
      {showDetails && topPlayers.length > 0 && (
        <div className="w-full max-w-md px-4 z-10 mb-3 animate-[float-up_0.7s_ease-out]">
          {/* Title */}
          <div className="text-center mb-2">
            <span className="text-sm font-serif font-black uppercase tracking-widest text-yellow-400 drop-shadow-md">
              🏆 Top Jucători
            </span>
          </div>

          {/* Compact Podium */}
          <div className="flex items-end justify-center gap-1.5 mb-2">
            {/* 2nd Place */}
            {topPlayers[1] && (
              <div className="flex flex-col items-center flex-1">
                <span className="text-lg mb-0.5">🥈</span>
                <div className="bg-gradient-to-b from-gray-300 to-gray-400 w-full text-center py-2 border border-black/30 shadow-md">
                  <div className="font-serif font-bold text-[9px] truncate px-1 text-black leading-tight">
                    {topPlayers[1].player_name}
                  </div>
                  <div className="text-[10px] font-mono font-black text-gray-700">
                    {topPlayers[1].score.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topPlayers[0] && (
              <div className="flex flex-col items-center flex-1">
                <span className="text-2xl mb-0.5">🥇</span>
                <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 w-full text-center py-3 border border-yellow-600 shadow-lg">
                  <div className="font-serif font-bold text-xs truncate px-1 text-black leading-tight">
                    {topPlayers[0].player_name}
                  </div>
                  <div className="text-xs font-mono font-black text-red-700">
                    {topPlayers[0].score.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topPlayers[2] && (
              <div className="flex flex-col items-center flex-1">
                <span className="text-base mb-0.5">🥉</span>
                <div className="bg-gradient-to-b from-amber-600 to-amber-700 w-full text-center py-1.5 border border-amber-800 shadow-md">
                  <div className="font-serif font-bold text-[8px] truncate px-1 text-white leading-tight">
                    {topPlayers[2].player_name}
                  </div>
                  <div className="text-[9px] font-mono font-black text-amber-200">
                    {topPlayers[2].score.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* See Full Leaderboard Button */}
          <button
            onClick={handleViewFullLeaderboard}
            className="w-full text-center text-[10px] font-serif font-bold text-yellow-400 hover:text-yellow-300 transition-colors py-1"
          >
            Vezi Clasamentul Complet →
          </button>
        </div>
      )}

      {/* SCROLLABLE CONTENT - Expanded Height with less padding */}
      <div className={`flex-grow w-full max-w-md px-4 pb-0 overflow-hidden z-10 transition-opacity duration-700 flex flex-col ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
         
         {/* COLLECTION (RECEIPT STYLE) */}
         <div className="bg-[#fffbf0] text-black p-1 shadow-2xl rotate-1 transform transition-transform hover:rotate-0 duration-500 flex flex-col h-[calc(100%-120px)]">
            <div className="border border-dashed border-gray-400 p-4 h-full flex flex-col w-full">
                <div className="text-center mb-4 border-b border-black pb-2 flex-shrink-0">
                    <h3 className="font-serif font-black text-2xl uppercase tracking-widest">Cupio</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600">Wishlist de Iarnă</p>
                </div>

                <div className="space-y-3 overflow-y-auto flex-grow pr-2 custom-scrollbar min-h-0">
                    {sortedItems.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs italic py-4">Nu ai adăugat produse.</p>
                    ) : (
                        sortedItems.map((item, idx) => {
                            const isVoucher = item.product.specialType === 'VOUCHER';
                            
                            return (
                                    <div 
                                   key={`${item.product.id}-${idx}`}
                                   onClick={() => { if (detailsClickable) setSelectedItem(item); }}
                                    className={`flex items-center justify-between py-2 border-b border-gray-200 cursor-pointer group hover:bg-black/5 px-2 transition-colors ${isVoucher ? 'bg-yellow-50/80' : ''}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {/* THUMBNAIL */}
                                        <div className={`w-10 h-10 flex-shrink-0 rounded-sm border overflow-hidden flex items-center justify-center bg-white ${isVoucher ? 'border-yellow-400' : 'border-gray-200'}`}>
                                            {isVoucher ? (
                                                <span className="text-lg">🎟️</span>
                                            ) : (
                                                <img 
                                                    src={item.product.imageUrl} 
                                                    alt="product" 
                                                    className="w-full h-full object-contain p-0.5"
                                                    referrerPolicy="no-referrer"
                                                />
                                            )}
                                        </div>

                                        <div className="flex flex-col overflow-hidden">
                                            <span className={`font-serif font-bold text-sm truncate ${isVoucher ? 'text-red-600' : 'text-black'}`}>
                                                {isVoucher ? '★ VOUCHER 15% ★' : item.product.name}
                                            </span>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-wider truncate">
                                                {item.product.category === 'ACCESSORIES' && isVoucher ? 'CUPON' : CATEGORY_CONFIG[item.product.category].label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                                        {item.count > 1 && <span className="text-xs font-mono text-gray-500">x{item.count}</span>}
                                        <span className="text-xs text-red-700">➜</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                <div className="mt-2 pt-2 border-t border-black text-center flex-shrink-0">
                     <p className="text-[10px] font-serif italic">Oferă-ți încredere!</p>
                     <p className="text-[8px] uppercase mt-1 tracking-widest text-gray-500">www.cupio.ro</p>
                </div>
            </div>
         </div>

      </div>

      {/* FOOTER */}
      <div className={`absolute bottom-0 left-0 w-full px-6 pb-6 pt-6 z-20 bg-gradient-to-t from-[#1a0505] via-[#1a0505]/95 to-transparent transition-transform duration-500 delay-300 ${showDetails ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <button 
                onClick={onRestart}
                className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-serif font-black text-lg shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/50"
            >
                🔄 ÎNCEARCĂ DIN NOU
            </button>
            
            <button 
                onClick={onMenu}
                className="w-full py-3 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs transition-all uppercase tracking-widest font-serif"
            >
                Meniu Principal
            </button>
          </div>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-[pop-in_0.2s]" onClick={() => setSelectedItem(null)}>
            <div 
                className="w-full max-w-md bg-[#fffbf0] p-1 shadow-2xl relative animate-[float-up_0.3s_ease-out_reverse] overflow-hidden rotate-1"
                onClick={e => e.stopPropagation()}
            >
                <div className="border border-black p-6 relative">
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-black hover:bg-black/10 transition-colors font-serif text-xl"
                    >
                        ✕
                    </button>

                    <div className="flex flex-col items-center gap-6 pt-2">
                        {selectedItem.product.specialType === 'VOUCHER' ? (
                            <>
                                 <div className="w-full h-32 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 p-1 flex items-center justify-center transform -rotate-1 shadow-lg">
                                    <div className="w-full h-full border-2 border-dashed border-white/50 flex flex-col items-center justify-center text-center">
                                        <span className="text-3xl filter drop-shadow">🎁</span>
                                        <span className="text-2xl font-black text-white drop-shadow-md font-serif tracking-widest">15% OFF</span>
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-serif italic font-black text-black leading-tight px-2">
                                        Felicitări!
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed px-4 font-serif">
                                        Acesta este cadoul tău de sărbători.
                                    </p>
                                </div>
                                <div 
                                    onClick={() => handleCopyCode("CUPIO15")}
                                    className="w-full bg-black text-white p-4 flex items-center justify-between cursor-pointer hover:bg-gray-900 transition-colors group border-2 border-yellow-500"
                                >
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] text-yellow-500 uppercase tracking-widest">Cod Voucher</span>
                                        <span className="text-xl font-mono font-bold tracking-widest">CUPIO15</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                                        {copiedCode ? "COPIAT! ✓" : "COPIAZĂ"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-48 h-48 bg-white shadow-inner flex items-center justify-center p-4 border border-gray-200">
                                    <img 
                                        src={selectedItem.product.imageUrl} 
                                        alt={selectedItem.product.name}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                
                                <div className="text-center space-y-2">
                                    <div className={`inline-flex items-center gap-1 px-3 py-1 bg-black text-white`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest`}>
                                            {CATEGORY_CONFIG[selectedItem.product.category].label}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-serif font-black text-black leading-tight px-2">
                                        {selectedItem.product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed border-t border-black/10 pt-3 mt-2 font-serif italic">
                                        {selectedItem.product.description}
                                    </p>
                                </div>

                                <a 
                                    href={`https://www.cupio.ro/catalogsearch/result/?q=${encodeURIComponent(selectedItem.product.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-red-700 hover:bg-red-600 text-white text-lg font-serif font-bold shadow-lg text-center transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    <span>VEZI PE SITE</span>
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* NAME INPUT MODAL */}
      {showNameInput && (
        <NameInputModal
          score={stats.finalScore}
          onSubmit={handleSubmitScore}
          onCancel={handleCancelNameInput}
          isUpdate={isUpdateMode}
          existingName={existingPlayerName}
        />
      )}

      {/* FULL LEADERBOARD MODAL */}
      {showFullLeaderboard && (
        <LeaderboardModal
          entries={fullLeaderboard}
          onClose={() => setShowFullLeaderboard(false)}
        />
      )}
    </div>
  );
};
