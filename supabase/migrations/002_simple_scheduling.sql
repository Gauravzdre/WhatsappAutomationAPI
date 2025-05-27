-- Add user-friendly scheduling columns
ALTER TABLE schedules 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
ADD COLUMN time TEXT, -- Format: "09:00"
ADD COLUMN days TEXT[], -- Array like ['mon', 'tue', 'wed']
ADD COLUMN sent_count INTEGER DEFAULT 0;

-- Update existing schedules to have active status
UPDATE schedules SET status = 'active' WHERE status IS NULL;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_time ON schedules(time);
CREATE INDEX IF NOT EXISTS idx_schedules_days ON schedules USING GIN(days);

-- Add helpful comments
COMMENT ON COLUMN schedules.time IS 'Time in HH:MM format (24-hour)';
COMMENT ON COLUMN schedules.days IS 'Array of day abbreviations: [sun, mon, tue, wed, thu, fri, sat]';
COMMENT ON COLUMN schedules.status IS 'active or paused - allows users to temporarily disable schedules'; 