-- STOLL Esportsenter Database Schema

-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  reg_number TEXT,
  service TEXT NOT NULL CHECK (service IN ('generelt', 'booking', 'sponsor')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'))
);

-- Reviews
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  visible BOOLEAN DEFAULT true
);

-- Membership packages
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronse', 'solv', 'gull', 'diamant')),
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  durability TEXT,
  checkup_price INTEGER DEFAULT 500,
  popular BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- Site content (editable text blocks)
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public read access for reviews (only visible ones)
CREATE POLICY "Public can view visible reviews" ON reviews
  FOR SELECT USING (visible = true);

-- Public read access for packages
CREATE POLICY "Public can view packages" ON packages
  FOR SELECT USING (true);

-- Public read access for site content
CREATE POLICY "Public can view site content" ON site_content
  FOR SELECT USING (true);

-- Public can insert contact submissions
CREATE POLICY "Public can submit contact forms" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Service role has full access (for admin panel)
CREATE POLICY "Service role full access to contact_submissions" ON contact_submissions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to reviews" ON reviews
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to packages" ON packages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to site_content" ON site_content
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default reviews from PROJECT.md
INSERT INTO reviews (author, rating, text, visible) VALUES
  ('KIF Gaming', 5, 'Fantastisk esportsenter! Toppmoderne utstyr og god stemning.', true),
  ('Kai Erik Holmefjord', 5, 'Fikk nødhjelp fra dette firmaet, da jeg hadde problemer med bilen med gangavstand til Fjøsangerveien. Veldig hjelpsom og god service, da jeg fikk hjelp i øyeblikket, så jeg fikk jobbe i tide.', true),
  ('Johannes Terast', 5, 'STOLL er det beste stedet for gaming i Kongsberg! Bra PCer, god internett og et fantastisk fellesskap. Anbefales!', true);

-- Insert default packages from PROJECT.md
INSERT INTO packages (name, tier, description, features, durability, checkup_price, popular, order_index) VALUES
  ('Bronse', 'bronse', 'Voksforsegling for deg som ønsker grunnleggende beskyttelse', 
   '["Håndvask av bil utvendig", "Voksforsegling", "Dekkfornyer"]'::jsonb,
   '1 år', 500, false, 1),
  ('Sølv', 'solv', 'Basis lakkforsegling for bedre beskyttelse',
   '["Alt fra Bronse", "Basis lakkforsegling (ikke to-komponent)", "Partikkelfjerning"]'::jsonb,
   '3 år', 500, false, 2),
  ('Gull', 'gull', 'Premium keramisk forsegling for langvarig beskyttelse',
   '["Håndvask av bil utvendig", "Børstebehandling alle eksteriør-detaljer", "Innvendig dørkanter", "Grundig motorvask", "Demontere alle hjul", "Vask under hjulbuer", "Vask av felger", "Partikkelfjerning", "Polering av bil i flere steg", "Full alkoholrens av lakkoverflater", "To-komponent lakkforsegling (2 lag steg 1, 1 lag steg 2)", "Dekkfornyer"]'::jsonb,
   '6 år', 500, false, 3),
  ('Diamant', 'diamant', 'Vår mest komplette pakke med full beskyttelse inne og ute',
   '["Håndvask av bil utvendig", "Børstebehandling alle eksteriør-detaljer", "Innvendig dørkanter", "Grundig motorvask", "Demontere alle hjul", "Vask under hjulbuer", "Vask av bremsecalipper", "Vask av felger", "Partikkelfjerning", "Polering av bil i flere steg", "Full alkoholrens av lakkoverflater", "To-komponent lakkforsegling (2 lag steg 1, 1 lag steg 2)", "Lakkforsegling av felger, dørkanter, motorrom, ruter, innvendige paneler", "Dekkfornyer", "Grundig innvendig vask", "Rengjøring av bagasjerom", "Behandling av innvendige plastdeler", "Behandling av seter, dørtrekk og dashbord"]'::jsonb,
   '6-9 år', 500, true, 4);
