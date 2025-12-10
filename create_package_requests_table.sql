-- Create package_requests table
CREATE TABLE IF NOT EXISTS package_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    package_name TEXT NOT NULL,
    package_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
    notes TEXT
);

-- Enable RLS
ALTER TABLE package_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on package_requests" ON package_requests;

-- Create specific policies for package_requests
CREATE POLICY "Enable insert for all users" ON package_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON package_requests
    FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON package_requests
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON package_requests
    FOR DELETE USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_package_requests_created_at ON package_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_package_requests_status ON package_requests(status);
