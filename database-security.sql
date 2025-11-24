-- Run this in your Supabase SQL Editor to add server-side validation

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Allow public read access" ON leaderboard;
DROP POLICY IF EXISTS "Allow public insert access" ON leaderboard;
DROP POLICY IF EXISTS "Allow score increase only" ON leaderboard;
DROP POLICY IF EXISTS "Allow score updates" ON leaderboard;

-- Add constraint to limit score range (0 to 999,999)
ALTER TABLE leaderboard 
  ADD CONSTRAINT score_range_check 
  CHECK (score >= 0 AND score <= 999999);

-- Add constraint to limit name length
ALTER TABLE leaderboard 
  ADD CONSTRAINT name_length_check 
  CHECK (char_length(player_name) >= 2 AND char_length(player_name) <= 50);

-- Policy: Anyone can read leaderboard
CREATE POLICY "Allow public read access" 
  ON leaderboard FOR SELECT 
  USING (true);

-- Policy: Anyone can insert with validation on basic fields
CREATE POLICY "Allow public insert access" 
  ON leaderboard FOR INSERT 
  WITH CHECK (
    score >= 0 
    AND score <= 999999 
    AND char_length(player_name) >= 2 
    AND char_length(player_name) <= 50
  );

-- Policy: Allow score updates with basic validation
-- (client and constraints already enforce 0–999999 and name length;
-- this policy just ensures updates stay within valid range)
CREATE POLICY "Allow score updates"
  ON leaderboard FOR UPDATE
  USING (true)
  WITH CHECK (
    score >= 0 AND score <= 999999
  );

-- Create function to limit entries per IP (optional - if you want to track)
-- Note: This requires Supabase Edge Functions or backend logic

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);

-- Add a view for sanitized leaderboard (no sensitive data)
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT 
  id,
  player_name,
  score,
  created_at
FROM leaderboard
ORDER BY score DESC;

-- Grant access to the view
GRANT SELECT ON public_leaderboard TO anon, authenticated;

