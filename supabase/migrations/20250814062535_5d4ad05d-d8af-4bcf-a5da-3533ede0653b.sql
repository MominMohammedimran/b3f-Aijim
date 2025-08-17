-- Update Supabase secrets with new Razorpay credentials
-- Note: This will update the function environment variables

-- These need to be set manually in Supabase dashboard at:
-- https://supabase.com/dashboard/project/zfdsrtwjxwzwbrtfgypm/settings/functions

-- Set RAZORPAY_KEY_ID = rzp_live_2Mc4YyXZYcwqy8
-- Set RAZORPAY_KEY_SECRET = wKfkpZci09M6zYzr5H6DqOLv

-- This migration just creates a note for reference
CREATE TABLE IF NOT EXISTS admin_notes (
  id SERIAL PRIMARY KEY,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO admin_notes (note) VALUES 
('Razorpay Live Credentials Updated: Key ID = rzp_live_2Mc4YyXZYcwqy8, Key Secret = wKfkpZci09M6zYzr5H6DqOLv');