-- 1. Create Strategies Table (SOSTAC Model) 
CREATE TABLE IF NOT EXISTS strategies ( 
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, 
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE, 
  title TEXT NOT NULL, 
  status TEXT DEFAULT 'draft', 
  -- SOSTAC Fields 
  situation TEXT, 
  objectives TEXT, 
  strategy TEXT, 
  tactics TEXT, 
  action TEXT, 
  control TEXT, 
  -- Personas (Array of objects: {name, age, bio, pain_points}) 
  buyer_personas JSONB DEFAULT '[]'::jsonb, 
  created_at TIMESTAMPTZ DEFAULT NOW(), 
  updated_at TIMESTAMPTZ DEFAULT NOW() 
); 

-- 2. Create Brand Kits Table 
CREATE TABLE IF NOT EXISTS brand_kits ( 
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, 
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE, 
  name TEXT NOT NULL, 
  -- Visual Assets 
  voice_sliders JSONB DEFAULT '{}'::jsonb, -- e.g., {"formal_casual": 50} 
  colors JSONB DEFAULT '[]'::jsonb, -- e.g., [{"name": "Primary", "hex": "#000", "type": "primary"}] 
  typography JSONB DEFAULT '[]'::jsonb, 
  guidelines JSONB DEFAULT '[]'::jsonb, -- Array of image URLs 
  created_at TIMESTAMPTZ DEFAULT NOW(), 
  updated_at TIMESTAMPTZ DEFAULT NOW() 
); 

-- 3. Enable RLS 
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY; 
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY; 

-- 4. Create Policies (Allow full access for authenticated users for now) 
CREATE POLICY "Enable all access for authenticated users" ON strategies FOR ALL USING (auth.role() = 'authenticated'); 
CREATE POLICY "Enable all access for authenticated users" ON brand_kits FOR ALL USING (auth.role() = 'authenticated');