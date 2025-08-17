-- Ensure b3fprintingsolutions@gmail.com admin user exists and fix potential auth issues
INSERT INTO public.admin_users (email, role, permissions, created_at, updated_at)
VALUES ('b3fprintingsolutions@gmail.com', 'admin', '["read", "write", "update", "delete"]'::jsonb, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  permissions = '["read", "write", "update", "delete"]'::jsonb,
  updated_at = NOW();