// Device-based storage for tracking user scores
// Uses localStorage to identify if user has already submitted a score from this device
// Compatible with: Chrome, Firefox, Safari (iOS/macOS), Edge, Samsung Internet, Opera

const DEVICE_SCORE_KEY = 'xmass_game_device_score';

// Check if localStorage is available (private browsing, some mobile browsers)
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export interface DeviceScoreData {
  playerName: string;
  scoreId: string; // The UUID from Supabase
  highScore: number;
  submittedAt: number; // timestamp
}

export const deviceStorage = {
  // Get stored score data for this device
  getDeviceScore(): DeviceScoreData | null {
    if (!isLocalStorageAvailable()) return null;
    
    try {
      const stored = localStorage.getItem(DEVICE_SCORE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Validate structure
      if (!parsed || 
          typeof parsed.playerName !== 'string' ||
          typeof parsed.scoreId !== 'string' ||
          typeof parsed.highScore !== 'number' ||
          typeof parsed.submittedAt !== 'number' ||
          parsed.highScore < 0 ||
          parsed.highScore > 999999) {
        return null;
      }
      
      return parsed;
    } catch (error) {
      // Silently fail - localStorage might be corrupted
      return null;
    }
  },

  // Save score data for this device with validation
  saveDeviceScore(data: DeviceScoreData): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      // Validate before saving
      if (!data.playerName || 
          !data.scoreId || 
          typeof data.highScore !== 'number' ||
          data.highScore < 0 ||
          data.highScore > 999999) {
        return;
      }
      
      const sanitized: DeviceScoreData = {
        playerName: data.playerName.trim().substring(0, 50),
        scoreId: data.scoreId,
        highScore: Math.floor(Math.max(0, Math.min(999999, data.highScore))),
        submittedAt: data.submittedAt
      };
      
      localStorage.setItem(DEVICE_SCORE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      // Silently fail - might be in private browsing mode
    }
  },

  // Clear device score (if user wants to reset)
  clearDeviceScore(): void {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(DEVICE_SCORE_KEY);
    } catch (error) {
      // Silently fail
    }
  },

  // Check if current score is higher than saved score
  isNewHighScore(currentScore: number): boolean {
    const deviceScore = this.getDeviceScore();
    if (!deviceScore) return true; // No previous score
    return currentScore > deviceScore.highScore;
  }
};

