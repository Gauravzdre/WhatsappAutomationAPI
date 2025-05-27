-- Add user_id column to schedules table
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing schedules to have a user_id (this will need to be done manually for existing data)
-- For now, we'll just ensure the column exists

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Users can view their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON schedules;

CREATE POLICY "Users can view their own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id); 