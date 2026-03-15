-- SEO Settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  structured_data JSONB,
  faq_schema JSONB,
  keywords TEXT[],
  canonical_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Public can read SEO settings
CREATE POLICY "Public can read SEO settings" ON seo_settings
  FOR SELECT USING (true);

-- Only authenticated users can modify
CREATE POLICY "Authenticated users can modify SEO settings" ON seo_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default SEO entries for main pages
INSERT INTO seo_settings (page_key, meta_title, meta_description) VALUES
  ('home', 'DD Auto Center | Verksted, Bilpleie & Bilsalg i Bergen', 'Profesjonelt verksted, bilpleie og bilsalg i Bergen. EU-kontroll, service, keramisk belegg og kvalitetsbiler. Besøk oss på Nesttun!'),
  ('verksted', 'Verksted Bergen | Service & EU-kontroll | DD Auto Center', 'Full service og vedlikehold av alle bilmerker. EU-kontroll, reparasjoner og diagnostikk. Erfarne teknikere på Nesttun.'),
  ('bilpleie', 'Bilpleie Bergen | Keramisk Belegg & Lakkforsegling | DD Auto Center', 'Profesjonell bilpleie med keramiske belegg, polering og lakkforsegling. Gi bilen din den behandlingen den fortjener.'),
  ('bilsalg', 'Bruktbil Bergen | Kjøp & Salg av Kvalitetsbiler | DD Auto Center', 'Vi kjøper og selger kvalitetsbiler. Ta kontakt for verdivurdering eller se vårt utvalg av bruktbiler i Bergen.')
ON CONFLICT (page_key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_updated_at();
