-- Create trends table for the Intel module
CREATE TABLE IF NOT EXISTS trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'TikTok', 'Instagram', 'YouTube'
  description TEXT,
  virality_score INTEGER DEFAULT 0, -- 0 to 100
  difficulty TEXT DEFAULT 'MEDIUM', -- 'EASY', 'MEDIUM', 'HARD'
  format TEXT, -- 'Audio', 'Filter', 'Challenge', 'CapCut Template'
  example_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

-- Public access policy (Everyone can read trends)
DROP POLICY IF EXISTS "Public read access for trends" ON trends;
CREATE POLICY "Public read access for trends" ON trends FOR SELECT USING (true);

-- Insert some seed data (Mock trends)
INSERT INTO trends (title, platform, description, virality_score, difficulty, format) VALUES
('Wes Anderson Style', 'TikTok', 'Symmetrical composition, pastel colors, quirky movement.', 95, 'HARD', 'Visual Style'),
('Tube Girl Effect', 'TikTok', 'Filming yourself confidently on public transport with 0.5x lens.', 88, 'EASY', 'Challenge'),
('AI Year Book', 'Instagram', 'Using AI to generate 90s yearbook photos.', 75, 'EASY', 'AI Filter'),
('Roman Empire', 'TikTok', 'Asking men how often they think about the Roman Empire.', 92, 'EASY', 'Interview'),
('CapCut: 2024 Recap', 'TikTok', 'Fast paced recap of the year using the specific template.', 85, 'EASY', 'CapCut Template');
