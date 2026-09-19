-- Migration: Add repair tracking fields to inspection_results
-- Created: 2026-09-17

-- Add repair tracking columns
ALTER TABLE inspection_results 
ADD COLUMN IF NOT EXISTS repair_status VARCHAR(20) DEFAULT 'pending' CHECK (repair_status IN ('pending', 'in_progress', 'repaired')),
ADD COLUMN IF NOT EXISTS repaired_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS repaired_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS repair_notes TEXT;

-- Create index for faster queries on repair status
CREATE INDEX IF NOT EXISTS idx_inspection_results_repair_status ON inspection_results(repair_status);

-- Create repair history table for audit trail
CREATE TABLE IF NOT EXISTS repair_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_result_id UUID REFERENCES inspection_results(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repair_history_result ON repair_history(inspection_result_id);
CREATE INDEX IF NOT EXISTS idx_repair_history_date ON repair_history(changed_at DESC);

COMMENT ON COLUMN inspection_results.repair_status IS 'Status perbaikan: pending (belum), in_progress (sedang diperbaiki), repaired (sudah diperbaiki)';
COMMENT ON TABLE repair_history IS 'Audit trail untuk perubahan status perbaikan item rusak';
