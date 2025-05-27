# URGENT SECURITY FIX - Client Data Isolation

## Problem
Currently, all users can see each other's client lists because the `clients` table lacks proper user isolation and Row Level Security (RLS) policies.

## Solution
You need to manually run these SQL commands in your Supabase dashboard to fix the security issue:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to the "SQL Editor" section
3. Create a new query and run the following commands **one by one**:

### Step 2: Add user_id column to clients table
```sql
-- Add user_id column to clients table
ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Step 3: Create index for performance
```sql
-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
```

### Step 4: Update existing clients (IMPORTANT)
```sql
-- Update existing clients to have a user_id
-- This assigns all existing clients to the first user in your system
-- If you have multiple users, you may need to manually assign clients to the correct users
UPDATE clients SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
```

### Step 5: Make user_id required
```sql
-- Make user_id NOT NULL after updating existing records
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
```

### Step 6: Drop old permissive policies
```sql
-- Drop existing policies that allow viewing all clients
DROP POLICY IF EXISTS "Users can view all clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;
DROP POLICY IF EXISTS "Users can delete clients" ON clients;
```

### Step 7: Create secure user-specific policies
```sql
-- Create new user-specific policies for clients
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);
```

### Step 8: Verify the fix
After running all commands, verify that:
1. The `clients` table has a `user_id` column
2. All existing clients have a `user_id` value
3. The new RLS policies are in place

You can check this with:
```sql
-- Check table structure
\d clients;

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'clients';

-- Check that all clients have user_id
SELECT COUNT(*) as total_clients, COUNT(user_id) as clients_with_user_id FROM clients;
```

## What this fixes:
- ✅ Users can now only see their own clients
- ✅ Users can only create clients under their own account
- ✅ Users can only edit/delete their own clients
- ✅ Dashboard statistics are now user-specific
- ✅ CSV import is already secure (was already filtering by user)
- ✅ Schedules are already secure (was already filtering by user)

## Code Changes Made:
The following files have been updated to properly filter by user_id:
- `src/app/clients/page.tsx` - Now filters clients by user_id
- `src/app/dashboard/page.tsx` - Now shows user-specific statistics
- `src/app/schedules/page.tsx` - Now filters schedules and clients by user_id

After applying the database changes, restart your application and test that users can only see their own data. 