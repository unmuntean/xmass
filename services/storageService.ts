
import { HighScoreEntry } from "../types";

const STORAGE_KEY = 'cupio_beauty_rush_highscores';
const MAX_SCORES = 10;

export const getHighScores = (): HighScoreEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load scores", e);
    return [];
  }
};

export const getTopScore = (): HighScoreEntry | null => {
  const scores = getHighScores();
  return scores.length > 0 ? scores[0] : null;
};

export const isNewHighScore = (score: number): boolean => {
  const scores = getHighScores();
  if (scores.length < MAX_SCORES) return true;
  // Check if score is higher than the lowest score on the leaderboard
  return score > scores[scores.length - 1].score;
};

export const saveHighScore = (name: string, score: number): HighScoreEntry[] => {
  const scores = getHighScores();
  
  const newEntry: HighScoreEntry = {
    name: name.trim() || "Anonym",
    score,
    date: Date.now()
  };

  scores.push(newEntry);
  
  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);
  
  // Keep top N
  const topScores = scores.slice(0, MAX_SCORES);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
  return topScores;
};
