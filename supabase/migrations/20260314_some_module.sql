-- ================================================
-- STOLL Esportsenter - SoMe Module
-- ================================================

-- SoMe Accounts (FB/IG tokens)
CREATE TABLE IF NOT EXISTS some_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  platform text NOT NULL, -- facebook, instagram
  page_id text,
  page_name text,
  access_token text,
  token_expires_at timestamptz,
  connected boolean DEFAULT false
);

-- SoMe Posts
CREATE TABLE IF NOT EXISTS some_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text,
  content text NOT NULL,
  image_url text,
  platform text, -- facebook, instagram, both
  post_type text DEFAULT 'general', -- event_reminder, weekly_update, recap, general, campaign
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  status text DEFAULT 'draft', -- draft, approved, scheduled, published, rejected
  scheduled_at timestamptz,
  published_at timestamptz,
  meta_post_id text, -- ID returned from Meta API after publishing
  feedback text,
  engagement_data jsonb
);

-- Brand Rules (feedback-loop)
CREATE TABLE IF NOT EXISTS some_brand_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  rule text NOT NULL,
  category text DEFAULT 'tone', -- tone, vocabulary, emoji, formatting, topics
  active boolean DEFAULT true
);

-- SoMe Schedule Templates
CREATE TABLE IF NOT EXISTS some_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer, -- 0=Sunday, 1=Monday...
  time_of_day time,
  post_type text,
  platform text,
  active boolean DEFAULT true
);

-- Default brand rules
INSERT INTO some_brand_rules (rule, category, active) VALUES
  ('Bruk engasjert og positiv tone. KIF STOLL er et fellesskap!', 'tone', true),
  ('Unngå teknisk sjargong. Hold det enkelt og tilgjengelig.', 'tone', true),
  ('Bruk emojis med måte – 1-3 per innlegg er passe.', 'emoji', true),
  ('Alltid inkluder call-to-action (f.eks. "Book plass!", "Møt opp!").', 'formatting', true),
  ('Unngå negativt innhold eller kritikk av konkurrenter.', 'topics', true)
ON CONFLICT DO NOTHING;

-- Default schedule
INSERT INTO some_schedule (day_of_week, time_of_day, post_type, platform, active) VALUES
  (2, '17:00', 'weekly_update', 'both', true),   -- Tuesday
  (5, '12:00', 'event_reminder', 'both', true),   -- Friday
  (0, '11:00', 'recap', 'facebook', true)          -- Sunday
ON CONFLICT DO NOTHING;
