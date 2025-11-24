
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#3c0e14] flex flex-col items-center justify-center z-50">
      {/* Snowfall Layer inside loading */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-pulse"></div>

      {/* Gift Animation */}
      <div className="relative w-32 h-32 mb-8 animate-bounce">
         <div className="absolute inset-0 bg-red-700 shadow-xl flex items-center justify-center border border-red-500">
             <div className="absolute inset-x-0 top-1/2 h-4 bg-yellow-500 -translate-y-1/2 shadow-sm"></div>
             <div className="absolute inset-y-0 left-1/2 w-4 bg-yellow-500 -translate-x-1/2 shadow-sm"></div>
         </div>
      </div>

      <div className="text-center z-10">
        <h2 className="text-4xl font-serif italic text-white tracking-widest mb-1 drop-shadow-lg">
            The Season
        </h2>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-[0.2em] mb-6">
            OF YOU
        </h2>
      </div>
      
      <div className="flex flex-col items-center gap-2 z-10">
        <div className="w-48 h-1 bg-red-900/50 rounded-full overflow-hidden border border-red-900">
           <div className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 w-1/2 animate-[shimmer-gold_1s_infinite]"></div>
        </div>
        <p className="text-yellow-500/80 text-[10px] uppercase tracking-widest animate-pulse font-serif">Despachetăm Surprizele...</p>
      </div>
    </div>
  );
};