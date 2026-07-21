-- ============================================================
-- Run this in Supabase SQL Editor to enable the public "apply your
-- school" questionnaire on the marketing site.
-- ============================================================

CREATE TABLE IF NOT EXISTS school_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  school_type TEXT CHECK (school_type IN ('kindergarten', 'primary', 'secondary', 'mixed')),
  student_count INTEGER,
  services_interested TEXT[] NOT NULL DEFAULT '{}',   -- subset of: brunch_box, bakery_menu, catering
  delivery_frequency TEXT CHECK (delivery_frequency IN ('daily', 'few_times_week', 'events_only')),
  preferred_start_date DATE,
  current_provider TEXT,
  dietary_considerations TEXT,
  referral_source TEXT CHECK (referral_source IN ('referral', 'social_media', 'search', 'other')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'onboarded', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unlike every other table in this app, RLS stays ON here: the public
-- form runs on the anon key, so anon must be allowed to INSERT, but must
-- NOT be able to read/update/delete other schools' submissions.
ALTER TABLE school_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can submit applications"
  ON school_applications FOR INSERT
  TO anon
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policy for anon => denied by default.
-- The admin side reads/updates via the service-role key (lib/supabase/admin.ts),
-- which bypasses RLS entirely.
