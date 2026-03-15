-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Public read access for images
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Service role can upload images  
CREATE POLICY "Service role upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- Service role can update images
CREATE POLICY "Service role update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images');

-- Service role can delete images
CREATE POLICY "Service role delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');

-- Authenticated users can also upload (for admin panel)
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Insert default site content
INSERT INTO site_content (key, value) VALUES
  -- Hero section
  ('hero_title', 'DIN BIL, VÅR LIDENSKAP!'),
  ('hero_subtitle', 'Stol på oss, vi kan bil! Våre teknikere har mange år med erfaring og kompetanse innenfor arbeidet vi leverer. Vi utfører jobben med kvalitetssikret kompetanse!'),
  ('hero_image', ''),
  
  -- About section
  ('about_history', '1. januar 2017 åpnet DD Auto Center dørene for første gang. Med vår kompetanse, kvalitetssikret arbeid og entusiasme innenfor bil er vårt formål og drøm å gjøre nettopp ditt bil-liv enklest mulig.'),
  ('about_growth', 'Da DD Auto Center ble stiftet i 2017, startet vi med 2 ansatte. I dag utgjør vi totalt 7 ansatte.'),
  ('about_values', 'Vi er til stede, tilgjengelig og legger hovedvekt på service for våre kunder. Vi ønsker å tilrettelegge en enkel og smidig opplevelse til deg som kunde – til en god pris!'),
  ('about_guarantee', 'Utfører du service hos oss får du også mobilitetsgaranti som er gyldig frem til neste service. Vår mobilitetsgaranti innebærer blant annet ved uhell gratis veihjelp, gratis leiebil mm. Mobilitetsgarantien er også gjeldende for deg i hele Europa.'),
  ('about_team_image', ''),
  
  -- Contact section
  ('contact_phone', '400 80 071'),
  ('contact_email_verksted', 'info@ddautocenter.no'),
  ('contact_email_bilpleie', 'bilpleie@ddautocenter.no'),
  ('contact_email_bilsalg', 'bilsalg@ddautocenter.no'),
  ('contact_address', 'Ulsmågvegen 12, 5224 Nesttun'),
  
  -- Services section
  ('service_verksted', 'Vi tilbyr full service og vedlikehold av alle bilmerker. Våre erfarne teknikere sørger for at din bil alltid er i toppform.'),
  ('service_bilpleie', 'Profesjonell bilpleie med keramiske belegg og lakkforsegling. Vi gir bilen din den behandlingen den fortjener.'),
  ('service_bilsalg', 'Vi kjøper og selger kvalitetsbiler. Ta kontakt for verdivurdering eller se vårt utvalg av bruktbiler.'),
  
  -- Footer/Opening hours
  ('opening_weekdays', 'Man-Fre: 08:00 - 16:00'),
  ('opening_saturday', 'Lørdag: Stengt'),
  ('opening_sunday', 'Søndag: Stengt'),
  
  -- Social media
  ('social_facebook', 'https://www.facebook.com/ddautocenter'),
  ('social_instagram', 'https://www.instagram.com/ddautocenter')
ON CONFLICT (key) DO NOTHING;

-- Function to update timestamp on site_content changes
CREATE OR REPLACE FUNCTION update_site_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for timestamp update
DROP TRIGGER IF EXISTS site_content_timestamp ON site_content;
CREATE TRIGGER site_content_timestamp
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_timestamp();
