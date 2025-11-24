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

  // Submit a new score
  async submitScore(playerName: string, score: number): Promise<{ success: boolean; id?: string }> {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ player_name: playerName, score }])
      .select('id')
      .single();

    if (error) {
      console.error('Error submitting score:', error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  },

  // Update an existing score
  async updateScore(scoreId: string, newScore: number): Promise<boolean> {
    const { error } = await supabase
      .from('leaderboard')
      .update({ score: newScore, created_at: new Date().toISOString() })
      .eq('id', scoreId);

    if (error) {
      console.error('Error updating score:', error);
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

