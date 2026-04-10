-- Add value range fields to deals table
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS min_value DECIMAL,
ADD COLUMN IF NOT EXISTS max_value DECIMAL;

-- Add project enhancement fields
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS urls TEXT[],
ADD COLUMN IF NOT EXISTS repos TEXT[],
ADD COLUMN IF NOT EXISTS team_members UUID[],
ADD COLUMN IF NOT EXISTS invoices UUID[],
ADD COLUMN IF NOT EXISTS notes JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_team_members ON projects USING GIN (team_members);
CREATE INDEX IF NOT EXISTS idx_projects_invoices ON projects USING GIN (invoices);
