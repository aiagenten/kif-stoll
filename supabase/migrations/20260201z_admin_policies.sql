-- Admin policies for authenticated users

-- Drop existing service_role policies (we'll use auth instead)
DROP POLICY IF EXISTS "Service role full access to contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Service role full access to reviews" ON reviews;
DROP POLICY IF EXISTS "Service role full access to packages" ON packages;
DROP POLICY IF EXISTS "Service role full access to site_content" ON site_content;

-- Authenticated users can read all contact submissions
CREATE POLICY "Authenticated users can read contact_submissions" ON contact_submissions
  FOR SELECT TO authenticated USING (true);

-- Authenticated users can update contact submissions (mark as read, etc)
CREATE POLICY "Authenticated users can update contact_submissions" ON contact_submissions
  FOR UPDATE TO authenticated USING (true);

-- Authenticated users can delete contact submissions
CREATE POLICY "Authenticated users can delete contact_submissions" ON contact_submissions
  FOR DELETE TO authenticated USING (true);

-- Authenticated users have full access to reviews
CREATE POLICY "Authenticated users can manage reviews" ON reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Authenticated users have full access to packages
CREATE POLICY "Authenticated users can manage packages" ON packages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Authenticated users have full access to site_content
CREATE POLICY "Authenticated users can manage site_content" ON site_content
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
