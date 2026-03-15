-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT DEFAULT 'STOLL Esportsenter',
  published BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
CREATE POLICY "Public can view published posts" ON blog_posts FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Service role full access" ON blog_posts;
CREATE POLICY "Service role full access" ON blog_posts FOR ALL USING (true);
