import React from 'react';
import { CATEGORY_CONFIG } from '../constants';
import { Category } from '../types';

interface TutorialScreenProps {
  onStart: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3c0e14]/95 backdrop-blur-xl text-white p-6 animate-[pop-in_0.3s_ease-out]">
      
      <div className="w-full max-w-md bg-[#fffbf0] text-black p-1 shadow-2xl">
          <div className="border-2 border-black p-6 md:p-8 flex flex-col items-center text-center relative">
              
              {/* Elegant corner accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-700"></div>
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-700"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-700"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-700"></div>

              <span className="text-3xl block mb-3">🎄</span>
              <h2 className="text-2xl md:text-3xl font-serif italic font-black tracking-wide mb-2">
                Invitație la Joc
              </h2>
              <div className="w-16 h-0.5 bg-red-600 mb-4"></div>

              <p className="text-gray-600 text-xs md:text-sm mb-6 font-serif italic leading-relaxed">
                Sortează produsele în categoriile corecte și descoperă surprizele din <span className="text-red-700 font-bold">The Season of You</span>.
              </p>

              {/* Compact, elegant category display */}
              <div className="w-full mb-4 bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 shadow-inner">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Categorii</p>
                <div className="flex justify-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 flex items-center justify-center text-lg shadow-sm">
                       💅
                     </div>
                     <span className="text-[8px] font-bold text-red-800 uppercase tracking-wider">Unghii</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 flex items-center justify-center text-lg shadow-sm">
                       💋
                     </div>
                     <span className="text-[8px] font-bold text-yellow-800 uppercase tracking-wider">Machiaj</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-300 flex items-center justify-center text-lg shadow-sm">
                       ✨
                     </div>
                     <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-wider">Accesorii</span>
                  </div>
                </div>
              </div>

              {/* Power-ups Section - Compact */}
              <div className="w-full mb-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-200 shadow-inner">
                <p className="text-[10px] uppercase tracking-widest text-amber-600 mb-2 font-bold flex items-center justify-center gap-1">
                  <span>⚡</span> Bonusuri
                </p>
                <div className="flex justify-center gap-2 text-center">
                  <div className="flex-1 max-w-[70px]">
                    <div className="text-xl mb-0.5">🎟️</div>
                    <div className="text-[8px] font-bold text-yellow-800 leading-tight">Voucher<br/>15%</div>
                  </div>
                  <div className="flex-1 max-w-[70px]">
                    <div className="text-xl mb-0.5">❤️</div>
                    <div className="text-[8px] font-bold text-pink-800 leading-tight">Extra<br/>Viață</div>
                  </div>
                  <div className="flex-1 max-w-[70px]">
                    <div className="text-xl mb-0.5">⏰</div>
                    <div className="text-[8px] font-bold text-blue-800 leading-tight">Încetinire<br/>2s</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={onStart}
                className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-lg md:text-xl font-serif font-bold shadow-lg transition-all active:scale-95 uppercase tracking-widest rounded"
              >
                ÎNCEPE JOCUL
              </button>
          </div>
      </div>
    </div>
  );
};
