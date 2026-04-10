-- Allow demo users to update demo projects (team members / invoices)
DROP POLICY IF EXISTS "projects_update_policy" ON projects;

CREATE POLICY "projects_update_policy" ON projects
  FOR UPDATE
  USING (
    (
      get_user_role(auth.uid()) = 'demo'
      AND is_demo = true
    )
    OR
    (
      get_user_role(auth.uid()) IN ('owner', 'account_manager')
      AND (is_demo = false OR is_demo IS NULL)
    )
  )
  WITH CHECK (
    (
      get_user_role(auth.uid()) = 'demo'
      AND is_demo = true
    )
    OR
    (
      get_user_role(auth.uid()) IN ('owner', 'account_manager')
      AND (is_demo = false OR is_demo IS NULL)
    )
  );
