-- Complete Database Setup (Schema Only)
-- Run this entire file in Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Draws table (งวดหวย)
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date TEXT NOT NULL UNIQUE,
  actual_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyers table (ลูกค้า)
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entries table (รายการแทง)
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  bet_type TEXT NOT NULL,
  amount TEXT NOT NULL,
  reverse_mode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forbidden numbers table (เลขอั้น)
CREATE TABLE IF NOT EXISTS forbidden_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(number, draw_id)
);

-- Add reverse_mode column if it doesn't exist (for existing databases)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entries' AND column_name = 'reverse_mode'
  ) THEN
    ALTER TABLE entries ADD COLUMN reverse_mode TEXT;
  END IF;
END $$;

-- Add draw_id to forbidden_numbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forbidden_numbers' AND column_name = 'draw_id'
  ) THEN
    ALTER TABLE forbidden_numbers ADD COLUMN draw_id UUID REFERENCES draws(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add is_open to forbidden_numbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forbidden_numbers' AND column_name = 'is_open'
  ) THEN
    ALTER TABLE forbidden_numbers ADD COLUMN is_open BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_entries_buyer_id ON entries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_entries_draw_id ON entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_entries_number ON entries(number);
CREATE INDEX IF NOT EXISTS idx_draws_draw_date ON draws(draw_date);
CREATE INDEX IF NOT EXISTS idx_draws_actual_date ON draws(actual_date);
CREATE INDEX IF NOT EXISTS idx_buyers_name ON buyers(name);
CREATE INDEX IF NOT EXISTS idx_forbidden_numbers_draw_id ON forbidden_numbers(draw_id);
CREATE INDEX IF NOT EXISTS idx_forbidden_numbers_number ON forbidden_numbers(number);

-- ============================================
-- Setup Complete
-- ============================================

-- Verify tables
SELECT
  'draws' as table_name,
  COUNT(*) as row_count
FROM draws
UNION ALL
SELECT
  'buyers' as table_name,
  COUNT(*) as row_count
FROM buyers
UNION ALL
SELECT
  'entries' as table_name,
  COUNT(*) as row_count
FROM entries
UNION ALL
SELECT
  'forbidden_numbers' as table_name,
  COUNT(*) as row_count
FROM forbidden_numbers;
