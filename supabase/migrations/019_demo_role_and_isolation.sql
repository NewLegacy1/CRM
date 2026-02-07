-- Add demo role and isolate demo data
-- This allows a "demo" user to only see demo data, while other users never see demo data

-- Step 1: Add is_demo flag to all relevant tables
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE lead_lists ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_is_demo ON clients(is_demo);
CREATE INDEX IF NOT EXISTS idx_leads_is_demo ON leads(is_demo);
CREATE INDEX IF NOT EXISTS idx_lead_lists_is_demo ON lead_lists(is_demo);
CREATE INDEX IF NOT EXISTS idx_projects_is_demo ON projects(is_demo);
CREATE INDEX IF NOT EXISTS idx_deals_is_demo ON deals(is_demo);
CREATE INDEX IF NOT EXISTS idx_meetings_is_demo ON meetings(is_demo);
CREATE INDEX IF NOT EXISTS idx_invoices_is_demo ON invoices(is_demo);
CREATE INDEX IF NOT EXISTS idx_activity_log_is_demo ON activity_log(is_demo);

-- Step 2: Update get_user_role function to support demo role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing RLS policies and recreate with demo isolation

-- CLIENTS TABLE
DROP POLICY IF EXISTS "clients_select_policy" ON clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON clients;
DROP POLICY IF EXISTS "clients_update_policy" ON clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON clients;

CREATE POLICY "clients_select_policy" ON clients
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "clients_insert_policy" ON clients
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager') 
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "clients_update_policy" ON clients
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "clients_delete_policy" ON clients
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

-- LEADS TABLE
DROP POLICY IF EXISTS "leads_select_policy" ON leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON leads;
DROP POLICY IF EXISTS "leads_update_policy" ON leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON leads;

CREATE POLICY "leads_select_policy" ON leads
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "leads_insert_policy" ON leads
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'cold_caller')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "leads_update_policy" ON leads
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'cold_caller', 'closer')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "leads_delete_policy" ON leads
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'cold_caller')
    AND (is_demo = false OR is_demo IS NULL)
  );

-- LEAD LISTS TABLE
DROP POLICY IF EXISTS "lead_lists_select_policy" ON lead_lists;
DROP POLICY IF EXISTS "lead_lists_insert_policy" ON lead_lists;
DROP POLICY IF EXISTS "lead_lists_update_policy" ON lead_lists;
DROP POLICY IF EXISTS "lead_lists_delete_policy" ON lead_lists;

CREATE POLICY "lead_lists_select_policy" ON lead_lists
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "lead_lists_insert_policy" ON lead_lists
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "lead_lists_update_policy" ON lead_lists
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "lead_lists_delete_policy" ON lead_lists
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

-- PROJECTS TABLE
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

CREATE POLICY "projects_select_policy" ON projects
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "projects_insert_policy" ON projects
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "projects_update_policy" ON projects
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "projects_delete_policy" ON projects
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

-- DEALS TABLE
DROP POLICY IF EXISTS "deals_select_policy" ON deals;
DROP POLICY IF EXISTS "deals_insert_policy" ON deals;
DROP POLICY IF EXISTS "deals_update_policy" ON deals;
DROP POLICY IF EXISTS "deals_delete_policy" ON deals;

CREATE POLICY "deals_select_policy" ON deals
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "deals_insert_policy" ON deals
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'closer', 'cold_caller')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "deals_update_policy" ON deals
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'closer')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "deals_delete_policy" ON deals
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

-- MEETINGS TABLE
DROP POLICY IF EXISTS "meetings_select_policy" ON meetings;
DROP POLICY IF EXISTS "meetings_insert_policy" ON meetings;
DROP POLICY IF EXISTS "meetings_update_policy" ON meetings;
DROP POLICY IF EXISTS "meetings_delete_policy" ON meetings;

CREATE POLICY "meetings_select_policy" ON meetings
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "meetings_insert_policy" ON meetings
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'closer', 'cold_caller')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "meetings_update_policy" ON meetings
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'closer', 'cold_caller')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "meetings_delete_policy" ON meetings
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

-- INVOICES TABLE
DROP POLICY IF EXISTS "invoices_select_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_policy" ON invoices;

CREATE POLICY "invoices_select_policy" ON invoices
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "invoices_insert_policy" ON invoices
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "invoices_update_policy" ON invoices
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "invoices_delete_policy" ON invoices
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager')
    AND (is_demo = false OR is_demo IS NULL)
  );

-- ACTIVITY LOG TABLE
DROP POLICY IF EXISTS "activity_log_select_policy" ON activity_log;
DROP POLICY IF EXISTS "activity_log_insert_policy" ON activity_log;

CREATE POLICY "activity_log_select_policy" ON activity_log
  FOR SELECT USING (
    CASE 
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "activity_log_insert_policy" ON activity_log
  FOR INSERT WITH CHECK (
    (is_demo = false OR is_demo IS NULL)
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Demo role isolation configured!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run migration 020 to load demo data with is_demo=true flags';
  RAISE NOTICE '   2. Create a demo user account and set their role to "demo"';
  RAISE NOTICE '   3. Demo users will only see demo data, other users will never see demo data';
END $$;
