
import React from 'react';
import { CATEGORY_CONFIG } from '../constants';
import { Category } from '../types';

interface TutorialScreenProps {
  onStart: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#2a0a12]/95 backdrop-blur-xl text-white p-6 animate-[pop-in_0.3s_ease-out]">
      
      <div className="w-full max-w-md bg-[#fffbf0] text-black p-1 shadow-2xl rotate-1">
          <div className="border border-black p-8 flex flex-col items-center text-center relative">
              
              {/* Decorative Corner */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-black"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-black"></div>

              <span className="text-4xl block mb-4">🎄</span>
              <h2 className="text-3xl font-serif italic font-black tracking-wide mb-2">
                Invitație la Joc
              </h2>
              <div className="w-16 h-0.5 bg-red-600 mb-6"></div>

              <p className="text-gray-600 text-sm mb-8 font-serif italic">
                Sortează produsele festive și descoperă surprizele din colecția <span className="text-red-700 font-bold">The Season of You</span>.
              </p>

              <div className="flex w-full gap-2 h-32 mb-8">
                {/* Zones */}
                <div className="flex-1 bg-red-100 border border-red-200 flex flex-col items-center justify-center p-2">
                   <div className="text-2xl mb-1">💅</div>
                   <div className="font-bold text-red-800 text-[10px] uppercase tracking-widest">UNGHII</div>
                </div>
                <div className="flex-1 bg-yellow-100 border border-yellow-200 flex flex-col items-center justify-center p-2">
                   <div className="text-2xl mb-1">💋</div>
                   <div className="font-bold text-yellow-800 text-[10px] uppercase tracking-widest">MACHIAJ</div>
                </div>
                <div className="flex-1 bg-emerald-100 border border-emerald-200 flex flex-col items-center justify-center p-2">
                   <div className="text-2xl mb-1">✨</div>
                   <div className="font-bold text-emerald-800 text-[10px] uppercase tracking-widest">ACCESORII</div>
                </div>
              </div>

              <button 
                onClick={onStart}
                className="w-full py-4 bg-red-700 hover:bg-red-600 text-white text-xl font-serif font-bold shadow-lg transition-all active:scale-95 uppercase tracking-widest"
              >
                ACCEPTĂ PROVOCAREA
              </button>
          </div>
      </div>
    </div>
  );
};