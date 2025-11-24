import React from 'react';
import { LeaderboardEntry } from '../services/leaderboardService';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ entries, onClose }) => {
  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `${position}.`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[pop-in_0.3s_ease-out]" onClick={onClose}>
      <div className="w-full max-w-md bg-gradient-to-br from-[#fffbf0] to-[#f5f0e8] p-1 shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="border-2 border-black p-6 bg-white relative flex flex-col max-h-full">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:bg-red-100 transition-colors font-serif text-2xl font-bold text-black z-50 rounded-full"
          >
            ✕
          </button>

          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-700"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-700"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-700"></div>

          <div className="text-center mb-6">
            <span className="text-3xl block mb-2">🏆</span>
            <h2 className="text-2xl font-serif font-black text-black mb-1">
              Clasament General
            </h2>
            <div className="w-16 h-0.5 bg-red-600 mx-auto"></div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
            {entries.length === 0 ? (
              <p className="text-center text-gray-500 italic py-8">
                Nicio înregistrare încă
              </p>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 border-2 transition-all
                      ${index < 3 
                        ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className={`flex-shrink-0 w-10 text-center font-bold
                      ${index < 3 ? 'text-2xl' : 'text-lg text-gray-600'}`}>
                      {getMedalEmoji(index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif font-bold text-black truncate">
                        {entry.player_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('ro-RO')}
                      </div>
                    </div>
                    <div className={`flex-shrink-0 font-mono font-black text-right
                      ${index < 3 ? 'text-xl text-red-700' : 'text-lg text-gray-700'}`}>
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}} />
    </div>
  );
};

