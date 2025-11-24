
import React, { useEffect, useState, useRef } from 'react';
import { GameStats, CollectedItem } from '../types';
import { CATEGORY_CONFIG } from '../constants';

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
  
  // Sort items: Vouchers first, then by count descending
  const sortedItems = [...stats.collectedItems].sort((a, b) => {
    const aIsVoucher = a.product.specialType === 'VOUCHER';
    const bIsVoucher = b.product.specialType === 'VOUCHER';
    if (aIsVoucher && !bIsVoucher) return -1;
    if (!aIsVoucher && bIsVoucher) return 1;
    return b.count - a.count;
  });

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
  }, [stats.finalScore]);

  const handleCopyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col items-center relative overflow-hidden bg-[#2a0a12]">
      
      {/* Winter Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4a0e1c_0%,_#1a0505_100%)] pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="flex-shrink-0 w-full flex flex-col items-center pt-8 pb-4 z-10 animate-[float-up_0.5s_ease-out]">
        <h2 className="text-3xl font-serif italic text-yellow-500 mb-1 drop-shadow-md tracking-wide">
           The Season of You
        </h2>
        <span className="text-6xl font-black font-mono text-white drop-shadow-xl tracking-tighter leading-none">
            {displayScore.toLocaleString()}
        </span>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mt-4"></div>
      </div>

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
                                    onClick={() => setSelectedItem(item)}
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
    </div>
  );
};
