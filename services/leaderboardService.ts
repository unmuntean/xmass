import { createClient } from '@supabase/supabase-js';

// Use environment variables for production, fallback to direct values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cmeggrpmspnaarozfwlp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtZWdncnBtc3BuYWFyb3pmd2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ5MzMsImV4cCI6MjA3OTU2MDkzM30.2ZkX8C04bVY3yQMAlTkLH1PpxPVqbgUkwFV5iCNcfw4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export const leaderboardService = {
  // Get top N players
  async getTopPlayers(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  },

  // Submit a new score – light validation, rely on DB constraints for the rest
  async submitScore(playerName: string, score: number): Promise<{ success: boolean; id?: string }> {
    const trimmedName = (playerName || '').trim();
    if (!trimmedName) {
      return { success: false };
    }

    if (!Number.isFinite(score) || score < 0) {
      return { success: false };
    }

    const sanitizedName = trimmedName.substring(0, 50);
    const sanitizedScore = Math.floor(Math.max(0, Math.min(999999, score)));

    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ player_name: sanitizedName, score: sanitizedScore }])
      .select('id')
      .single();

    if (error) {
      return { success: false };
    }

    return { success: true, id: data?.id };
  },

  // Update an existing score – allow changing both score and name
  async updateScore(scoreId: string, newScore: number, playerName?: string): Promise<boolean> {
    if (!scoreId || typeof scoreId !== 'string') {
      return false;
    }

    if (!Number.isFinite(newScore) || newScore < 0) {
      return false;
    }

    const sanitizedScore = Math.floor(Math.max(0, Math.min(999999, newScore)));

    const updatePayload: { score: number; player_name?: string } = {
      score: sanitizedScore,
    };

    const trimmedName = (playerName || '').trim();
    if (trimmedName) {
      updatePayload.player_name = trimmedName.substring(0, 50);
    }

    const { error } = await supabase
      .from('leaderboard')
      .update(updatePayload)
      .eq('id', scoreId);

    if (error) {
      return false;
    }

    return true;
  },

  // Check if score qualifies for top 10
  async isHighScore(score: number): Promise<boolean> {
    const topPlayers = await this.getTopPlayers(10);
    
    // If less than 10 entries, it's automatically a high score
    if (topPlayers.length < 10) return true;
    
    // Check if score is higher than the 10th place
    return score > topPlayers[topPlayers.length - 1].score;
  }
};

