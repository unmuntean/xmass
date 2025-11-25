
import React, { useState, useEffect } from 'react';
import { CampaignData, GameState, GameStats } from './types';
import { fetchCupioCampaign } from './services/geminiService';
import { imagePreloader } from './services/imagePreloader';
import { Game } from './components/Game';
import { LoadingScreen } from './components/LoadingScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { Snowfall } from './components/Snowfall';
import { BackgroundMusic } from './components/BackgroundMusic';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INIT);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [globalMuted, setGlobalMuted] = useState<boolean>(false);

  useEffect(() => {
    const initGame = async () => {
      setGameState(GameState.LOADING);
      const data = await fetchCupioCampaign();
      setCampaignData(data);
      
      // Preload all product images during loading screen
      await imagePreloader.preloadProducts(data.products);
      
      setGameState(GameState.MENU);
    };
    initGame();
  }, []);

  const handleMenuReturn = () => {
    setGameState(GameState.MENU);
  };

  const goToTutorial = () => setGameState(GameState.TUTORIAL);
  const startGame = () => setGameState(GameState.PLAYING);
  
  const handleGameOver = (stats: GameStats) => {
    setGameStats(stats);
    setGameState(GameState.GAMEOVER);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#3c0e14] text-white overflow-hidden font-sans selection:bg-red-500 selection:text-white">
      
      {/* GLOBAL BACKGROUND MUSIC (local MP3 in /media) */}
      {/* This component persists across all states to keep music looping seamlessly */}
      <BackgroundMusic muted={globalMuted} />

      {/* GLOBAL SNOWFALL */}
      <Snowfall
        mood={
          gameState === GameState.PLAYING || gameState === GameState.LOADING
            ? 'calm'
            : 'blizzard'
        }
      />

      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-red-900/20 rounded-full blur-[100px] animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-yellow-900/10 rounded-full blur-[100px] animate-pulse duration-[5000ms]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      </div>

      {/* GLOBAL TOP & BOTTOM GRADIENTS - Subtle visual framing, behind UI */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-[5]"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-[5]"></div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full h-full">
        
        {gameState === GameState.LOADING && <LoadingScreen />}

        {gameState === GameState.TUTORIAL && (
            <TutorialScreen onStart={startGame} />
        )}

        {gameState === GameState.MENU && campaignData && (
          <div className="h-full flex flex-col items-center justify-center p-6 max-w-md mx-auto animate-[float-up_0.5s_ease-out]">
              
              {/* HERO TITLE */}
              <div className="text-center mb-12 relative">
                 <h2 className="text-2xl font-serif text-yellow-500 italic mb-2 tracking-widest drop-shadow-md">The Season</h2>
                 <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-none font-serif">
                   <span className="block text-white drop-shadow-2xl">OF YOU</span>
                 </h1>
              </div>
              
              {/* CAMPAIGN CARD */}
              <div className="w-full bg-[#fffbf0] text-black p-1 shadow-2xl mb-12 transform -rotate-1 group hover:rotate-0 transition-transform duration-300">
                <div className="border border-black p-6 flex flex-col items-center text-center relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-700 text-white text-[10px] font-bold uppercase px-3 py-0.5 tracking-widest">
                        Ediție Limitată
                    </span>
                    
                    <h2 className="text-2xl font-serif italic font-black mb-2 mt-2">
                        {campaignData.title}
                    </h2>
                    <p className="text-xs text-gray-600 font-serif italic leading-relaxed mb-4">
                        {campaignData.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-red-800 tracking-widest">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                        {campaignData.products.length} produse festive
                    </div>
                </div>
              </div>

              {/* ACTIONS */}
              <button 
                onClick={goToTutorial}
                className="w-full py-5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-xl font-serif font-bold shadow-[0_10px_40px_rgba(227,0,79,0.3)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group border border-red-400/30 uppercase tracking-widest"
              >
                <span>ÎNCEPE JOCUL</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Sources Footer */}
              <div className="absolute bottom-6 text-[10px] text-red-200/50 text-center w-full px-10 font-serif">
                   <p className="mb-1 uppercase tracking-widest italic">Oferă-ți încredere</p>
                   <div className="flex justify-center gap-3">
                     <a href="https://www.cupio.ro" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">cupio.ro</a>
                   </div>
              </div>
          </div>
        )}

        {gameState === GameState.PLAYING && campaignData && (
          <Game 
            campaignData={campaignData} 
            onGameOver={handleGameOver}
            onExit={handleMenuReturn}
            globalMuted={globalMuted}
            setGlobalMuted={setGlobalMuted}
          />
        )}

        {gameState === GameState.GAMEOVER && gameStats && (
          <GameOverScreen 
            stats={gameStats} 
            onRestart={startGame} 
            onMenu={handleMenuReturn} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
