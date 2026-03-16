
-- Allow public read for media bucket
CREATE POLICY "media_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- Allow any user (incl anon) to upload to media bucket (admin is auth-gated in UI)
CREATE POLICY "media_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');

-- Allow any user to update media
CREATE POLICY "media_update" ON storage.objects FOR UPDATE USING (bucket_id = 'media');

-- Allow any user to delete from media
CREATE POLICY "media_delete" ON storage.objects FOR DELETE USING (bucket_id = 'media');

