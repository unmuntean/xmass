import React, { useState } from 'react';

interface NameInputModalProps {
  score: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export const NameInputModal: React.FC<NameInputModalProps> = ({ score, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      alert('Te rog introdu un nume valid (minim 2 caractere)');
      return;
    }

    setIsSubmitting(true);
    onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[pop-in_0.3s_ease-out]">
      <div className="w-full max-w-sm bg-gradient-to-br from-[#fffbf0] to-[#f5f0e8] p-1 shadow-2xl">
        <div className="border-2 border-black p-6 bg-white relative">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-700"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-700"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-700"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-700"></div>

          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🎉</span>
            <h2 className="text-2xl font-serif font-black text-black mb-2">
              Scor Record!
            </h2>
            <div className="text-3xl font-black font-mono text-red-700 mb-2">
              {score.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 font-serif italic">
              Introdu numele pentru clasament
            </p>
          </div>

          <input
            type="text"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Numele tău"
            className="w-full px-4 py-3 border-2 border-black text-center text-lg font-bold bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-red-700 mb-4"
            autoFocus
            disabled={isSubmitting}
          />

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 border-2 border-black bg-white hover:bg-gray-100 text-black font-serif font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              ANULEAZĂ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || name.trim().length < 2}
              className="flex-1 py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-serif font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SE SALVEAZĂ...' : 'SALVEAZĂ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

