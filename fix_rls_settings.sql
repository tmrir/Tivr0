-- Fix RLS for site_settings table
-- This allows anonymous users to read and write settings

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view site_settings" ON site_settings;
DROP POLICY IF EXISTS "Users can update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Users can insert site_settings" ON site_settings;

-- 2. Enable RLS on the table (if not already enabled)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for anonymous access (for local development)
CREATE POLICY "Allow anonymous read access to site_settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access to site_settings" ON site_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to site_settings" ON site_settings
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous upsert access to site_settings" ON site_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Grant necessary permissions to anon role
GRANT ALL ON site_settings TO anon;
GRANT ALL ON site_settings TO authenticated;

-- 5. Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'site_settings';

-- 6. Test query (should work now)
SELECT COUNT(*) FROM site_settings;
