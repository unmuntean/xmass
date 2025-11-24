import React, { useMemo, useState } from 'react';
import { Product } from '../types';

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
  const scale = useMemo(() => 0.98 + Math.random() * 0.04, []); 
  const isVoucher = product.specialType === 'VOUCHER';
  
  // Only use crossOrigin for trusted domains that support CORS
  const needsCrossOrigin = useMemo(() => {
    if (!product.imageUrl) return false;
    return product.imageUrl.includes('cupio.ro') || product.imageUrl.includes('cdn.');
  }, [product.imageUrl]);

  return (
    <div 
      className={`absolute flex flex-col items-center justify-center w-24 h-36 md:w-32 md:h-48 will-change-transform pointer-events-none
        ${feedback === 'failure' ? 'grayscale opacity-50' : ''}
        ${feedback === 'success' ? 'z-[200]' : ''} 
      `}
      style={{
        left: `${xPosition}%`,
        top: `${yPosition}%`,
        transform: `translate(-50%, -50%) scale(${feedback === 'success' ? 0.4 : scale})`,
        zIndex: isTarget ? 999 : (feedback ? 150 : Math.floor(yPosition)),
        transition: feedback === 'success' ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s' : 'none'
      }}
    >
      {/* TARGET INDICATOR */}
      {isTarget && !feedback && (
        <>
          <div className="absolute -inset-4 z-0 pointer-events-none">
             <div className={`absolute inset-0 rounded-3xl ${isVoucher ? 'bg-yellow-400/20' : 'bg-yellow-300/20'} blur-xl animate-pulse`}></div>
             <div className={`absolute inset-2 rounded-2xl border-[3px] ${isVoucher ? 'border-yellow-400' : 'border-yellow-300'} shadow-[0_0_24px_rgba(250,204,21,0.7)] animate-pulse`}></div>
          </div>
        </>
      )}

      {feedback === 'failure' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
           <span className="text-5xl md:text-7xl font-black text-red-500 drop-shadow-[0_4px_12px_rgba(239,68,68,0.6)] animate-shake">✖</span>
        </div>
      )}

      {/* CARD CONTAINER */}
      <div className={`relative w-20 h-20 md:w-28 md:h-28 rounded-2xl z-10 overflow-visible
        transition-all duration-200 ease-out
        ${isTarget ? 'scale-105' : ''}
      `}>
        {/* Card Background - FULL WHITE */}
        <div className={`absolute inset-0 rounded-2xl overflow-hidden
          ${isVoucher 
            ? 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500' 
            : 'bg-white'}
          shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.1)]
        `}>
          {/* Subtle shine for vouchers only */}
          {isVoucher && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60"></div>
          )}
        </div>

        {/* Voucher animated shine */}
        {isVoucher && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl z-10">
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-[shimmer-gold_3s_ease-in-out_infinite]"></div>
            </div>
        )}

        {/* Inner border for premium look */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none z-20
          ${isVoucher ? 'border-2 border-yellow-300/30' : 'border border-gray-200/40'}
        `}></div>

        {/* Content Container - Minimal padding for BIGGER IMAGE */}
        <div className={`relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center z-10
            ${isVoucher ? 'p-2' : 'p-1.5'}
        `}>
          {isVoucher ? (
            <div className="flex flex-col items-center justify-center text-center">
                <span className="text-3xl md:text-5xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">🎟️</span>
                <span className="text-sm md:text-lg font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] leading-none mt-1">15%</span>
            </div>
          ) : !imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-[90%] h-[90%] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]" 
                  onError={(e) => {
                    console.error(`Failed to load image for ${product.name}:`, product.imageUrl);
                    setImageError(true);
                  }}
                  referrerPolicy="no-referrer"
                  {...(needsCrossOrigin ? { crossOrigin: "anonymous" } : {})}
                  decoding="async"
                  loading="lazy"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <span className="text-3xl opacity-50">📦</span>
            </div>
          )}
        </div>

        {/* Outer glow effect - softer for white bg */}
        <div className={`absolute -inset-1 rounded-3xl -z-10 blur-md opacity-30
          ${isVoucher ? 'bg-gradient-to-br from-yellow-300 to-amber-500' : 'bg-gray-200'}
        `}></div>
      </div>

      {/* LABEL */}
      {!feedback && (
        <div className={`relative z-20 mt-3 px-3 py-2 rounded-xl backdrop-blur-md max-w-[180px] w-auto
          transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.3)]
            ${isVoucher 
              ? 'bg-gradient-to-br from-yellow-900/95 via-yellow-800/95 to-amber-900/95 border-2 border-yellow-400/60' 
              : 'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 border-2 border-white/20'}
        `}>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-30"></div>
          
          <p className={`relative text-[10px] md:text-xs font-bold text-center leading-snug line-clamp-2
             ${isVoucher ? 'text-yellow-50' : 'text-white'}`}>
            {product.name}
          </p>
        </div>
      )}
    </div>
  );
};
