-- ============================================================
-- Run this in Supabase SQL Editor to enable the Expenses feature
-- ============================================================

-- 1. Expenses table (indirect costs: salaries, electricity, rent…)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,  -- NULL = company-wide
  category TEXT NOT NULL,
  description TEXT,
  amount_lbp NUMERIC(15,2) NOT NULL CHECK (amount_lbp > 0),
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
