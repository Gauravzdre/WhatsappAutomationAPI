-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    cron TEXT NOT NULL,
    last_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_client_id ON schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_schedules_last_sent ON schedules(last_sent);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all clients" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert clients" ON clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clients" ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete clients" ON clients
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all schedules" ON schedules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert schedules" ON schedules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update schedules" ON schedules
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete schedules" ON schedules
    FOR DELETE USING (auth.role() = 'authenticated'); 