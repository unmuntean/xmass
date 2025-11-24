
import React, { useMemo, useState } from 'react';
import { Product, ProductForm } from '../types';

interface ProductCardProps {
  product: Product;
  xPosition: number;
  yPosition: number;
  rotation: number;
  feedback?: 'success' | 'failure' | null;
  isTarget?: boolean; 
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, xPosition, yPosition, rotation, feedback, isTarget }) => {
  const [imageError, setImageError] = useState(false);
  const scale = useMemo(() => 0.95 + Math.random() * 0.1, []); 
  const isVoucher = product.specialType === 'VOUCHER';

  return (
    <div 
      className={`absolute flex flex-col items-center justify-center w-28 h-32 will-change-transform pointer-events-none
        ${feedback === 'failure' ? 'grayscale opacity-50' : ''}
        ${feedback === 'success' ? 'z-[200]' : ''} 
      `}
      style={{
        left: `${xPosition}%`,
        top: `${yPosition}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${feedback === 'success' ? 0.4 : scale})`,
        // Priority Z-Index for Target: 999 ensures it is ALWAYS on top of debris/background
        zIndex: isTarget ? 999 : (feedback ? 150 : Math.floor(yPosition)),
        transition: feedback === 'success' ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s' : 'transform 0.1s linear'
      }}
    >
      {/* TARGET INDICATOR - High Visibility Overlay */}
      {isTarget && !feedback && (
        <div className="absolute -inset-10 z-0 pointer-events-none">
            {/* Outer Glow to help see it in peripheral vision */}
            <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${isVoucher ? 'bg-yellow-200/40' : 'bg-yellow-400/20'}`}></div>
            
            {/* Solid Indicator Border - Counter-rotated to stand out against the tilted card */}
            <div 
                className="absolute inset-2 border-[6px] border-yellow-400 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.8)]"
                style={{ transform: `rotate(${-rotation}deg)` }}
            >
                {/* Inner White Border for Contrast */}
                <div className="absolute inset-[2px] border-2 border-white rounded-xl opacity-70"></div>
            </div>

            {/* Bouncing Arrow - Larger and distinct */}
             <div 
                className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
                style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
             >
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V16M12 16L6 10M12 16L18 10" stroke="#FACC15" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
      )}

      {feedback === 'failure' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
           <span className="text-6xl font-black text-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-shake">✖</span>
        </div>
      )}

      {/* CARD CONTAINER */}
      <div className={`relative w-24 h-24 transition-all duration-200 shadow-xl rounded-xl z-10 overflow-hidden
        ${isVoucher 
            ? 'bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 ring-2 ring-yellow-200 shadow-[0_0_20px_rgba(253,224,71,0.5)]' 
            : !imageError && product.imageUrl ? 'bg-white/95 backdrop-blur-sm ring-2 ring-white/50' : 'bg-gray-800 ring-2 ring-gray-500'}
        ${feedback === 'failure' ? 'blur-sm ring-4 ring-red-500' : ''}
        ${feedback === 'success' ? 'ring-4 ring-green-400' : ''}
        ${isTarget ? 'scale-105' : ''}
      `}>
        {/* Shine Effect for Voucher */}
        {isVoucher && (
            <div className="absolute inset-0 overflow-hidden rounded-lg z-20">
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] animate-[shimmer-gold_2s_infinite]"></div>
            </div>
        )}
        
        {/* Subtle Frost overlay for regular items */}
        {!isVoucher && (
             <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none z-20"></div>
        )}

        <div className={`relative w-full h-full rounded-lg overflow-hidden shadow-inner p-1 flex items-center justify-center
            ${isVoucher ? 'bg-transparent' : 'bg-white'}
        `}>
          {isVoucher ? (
            // VOUCHER VISUAL
            <div className="flex flex-col items-center justify-center text-center p-1">
                <span className="text-3xl filter drop-shadow-md">🎟️</span>
                <span className="text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-none mt-1">15% OFF</span>
                <span className="text-[8px] text-yellow-100 font-bold tracking-widest uppercase mt-0.5">CUPIO</span>
            </div>
          ) : !imageError ? (
            <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply" 
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
            />
          ) : (
            // FALLBACK UI for broken images
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 text-center p-1">
                <span className="text-2xl">📦</span>
                <span className="text-[8px] font-bold text-gray-400 leading-tight mt-1">CUPIO</span>
            </div>
          )}
        </div>
      </div>

      {!feedback && (
        <div className={`mt-2 px-3 py-1.5 bg-black/90 backdrop-blur-md rounded-lg border shadow-2xl max-w-[160px] transition-all duration-200 
            ${isVoucher ? 'border-yellow-400 bg-yellow-900/90' : isTarget ? 'border-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'border-white/20 opacity-80'}
        `}>
          <p className={`text-[11px] font-bold text-center leading-tight whitespace-normal line-clamp-2 
             ${isVoucher ? 'text-yellow-300' : isTarget ? 'text-yellow-300' : 'text-gray-300'}`}>
            {product.name}
          </p>
        </div>
      )}
    </div>
  );
};