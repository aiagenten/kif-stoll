-- ================================================
-- STOLL Esportsenter - Nye tabeller
-- ================================================

-- Events tabell
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time,
  location text,
  image text,
  event_type text DEFAULT 'arrangement', -- tournament, trening, arrangement, bursdag
  capacity integer,
  booking_enabled boolean DEFAULT false,
  published boolean DEFAULT true
);

-- Bookings tabell
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  participants integer DEFAULT 1,
  status text DEFAULT 'pending', -- pending, confirmed, cancelled
  notes text
);

-- Sponsors tabell
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  logo_url text,
  website text,
  order_index integer DEFAULT 0,
  visible boolean DEFAULT true
);

-- Chat messages (for AI chatbot quota tracking)
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id text,
  message text,
  role text DEFAULT 'user' -- user, assistant
);

-- ================================================
-- RLS Policies
-- ================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Events: public read published, admin all
CREATE POLICY "Public read published events" ON events
  FOR SELECT USING (published = true);

CREATE POLICY "Admin all events" ON events
  FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: public insert, admin read/update
CREATE POLICY "Public insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin all bookings" ON bookings
  FOR ALL USING (auth.role() = 'authenticated');

-- Sponsors: public read visible, admin all
CREATE POLICY "Public read visible sponsors" ON sponsors
  FOR SELECT USING (visible = true);

CREATE POLICY "Admin all sponsors" ON sponsors
  FOR ALL USING (auth.role() = 'authenticated');

-- Chat messages: public insert, admin read
CREATE POLICY "Public insert chat" ON chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read chat" ON chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- ================================================
-- Updated at trigger for events
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Sample data
-- ================================================
INSERT INTO sponsors (name, logo_url, website, order_index, visible) VALUES
  ('Sponsor 1', '', 'https://example.com', 1, true),
  ('Sponsor 2', '', 'https://example.com', 2, true),
  ('Sponsor 3', '', 'https://example.com', 3, true)
ON CONFLICT DO NOTHING;
