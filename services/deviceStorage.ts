// Device-based storage for tracking user scores
// Uses localStorage to identify if user has already submitted a score from this device

const DEVICE_SCORE_KEY = 'xmass_game_device_score';

export interface DeviceScoreData {
  playerName: string;
  scoreId: string; // The UUID from Supabase
  highScore: number;
  submittedAt: number; // timestamp
}

export const deviceStorage = {
  // Get stored score data for this device
  getDeviceScore(): DeviceScoreData | null {
    try {
      const stored = localStorage.getItem(DEVICE_SCORE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading device score:', error);
      return null;
    }
  },

  // Save score data for this device
  saveDeviceScore(data: DeviceScoreData): void {
    try {
      localStorage.setItem(DEVICE_SCORE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving device score:', error);
    }
  },

  // Clear device score (if user wants to reset)
  clearDeviceScore(): void {
    try {
      localStorage.removeItem(DEVICE_SCORE_KEY);
    } catch (error) {
      console.error('Error clearing device score:', error);
    }
  },

  // Check if current score is higher than saved score
  isNewHighScore(currentScore: number): boolean {
    const deviceScore = this.getDeviceScore();
    if (!deviceScore) return true; // No previous score
    return currentScore > deviceScore.highScore;
  }
};

