# 🎭 Demo User Setup Guide

This guide shows you how to create an isolated demo environment where a demo user can only see demo data, and all other users never see demo data.

## Overview

- **Demo Role**: A special user role that only sees demo/fake data
- **Data Isolation**: Demo data is completely separate from real data
- **Permanent Setup**: The demo environment stays active - no need to clean up after demos

## Quick Setup (5 minutes)

### Step 1: Run Migrations

In your Supabase Dashboard SQL Editor, run these migrations in order:

```sql
-- 1. First run: 016_add_deal_project_enhancements.sql
-- 2. Then run: 019_demo_role_and_isolation.sql
-- 3. Then run: 021_add_demo_role_to_profiles.sql
-- 4. Finally run: 020_demo_data_with_isolation.sql
```

### Step 2: Create a Demo User Account

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication → Users** in Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: `demo@yourcompany.com` (or any email)
   - **Password**: Create a secure password (you'll share this with your client)
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create user**
5. Copy the user's UUID (you'll need it for the next step)

#### Option B: Via SQL (Advanced)

```sql
-- Create demo user (replace email and password)
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'demo@yourcompany.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

### Step 3: Set the User's Role to "demo"

In Supabase SQL Editor, run this (replace USER_UUID with the actual UUID from step 2):

```sql
-- Set the user's role to demo
UPDATE profiles 
SET role = 'demo', 
    display_name = 'Demo User'
WHERE id = 'USER_UUID_HERE';

-- If profile doesn't exist, create it:
INSERT INTO profiles (id, role, display_name)
VALUES ('USER_UUID_HERE', 'demo', 'Demo User')
ON CONFLICT (id) DO UPDATE SET role = 'demo';
```

### Step 4: Test the Demo Account

1. Log out of your CRM
2. Log in with the demo credentials
3. You should now see all the demo data:
   - 5 demo clients
   - 5 demo leads
   - 5 demo projects
   - 5 demo deals
   - 3 demo meetings
   - 5 demo invoices

### Step 5: Verify Isolation

1. Log back in with your regular account
2. You should NOT see any of the demo data
3. Demo data is completely hidden from non-demo users

## 🎬 For Your Client Demo

### Sharing Access

You can share the demo account with your client:

1. **Email**: `demo@yourcompany.com` (or whatever email you used)
2. **Password**: (the password you set)
3. **URL**: Your CRM production URL

They can explore the CRM with realistic data without seeing or affecting your real data.

### What Demo Users Can Do

✅ **Can Do:**
- View all pages (Dashboard, Clients, Leads, Deals, Projects, Meetings, Invoices)
- See all demo data
- Click through the interface
- Navigate between pages

❌ **Cannot Do:**
- Create, edit, or delete any data (read-only)
- See any real production data
- Affect real users' data

### What Real Users See

When your team logs in with regular accounts:
- ✅ See all real production data
- ❌ Never see demo data
- Demo data is completely invisible

## Demo Data Included

### 5 Demo Companies
- **Acme Corporation** - Website redesign project
- **TechStart Industries** - Landing page & funnel
- **Global Ventures LLC** - Completed enterprise portal
- **Peak Performance Coaching** - Sales funnel in progress
- **Urban Eats Restaurant Group** - Reservation system

### 5 Demo Deals
- Range: $8,500 - $125,000
- Various stages: qualification → closed_won
- All include min/max value ranges

### 5 Demo Projects
- Active projects: 30% - 85% complete
- URLs, GitHub repos, team members
- Internal notes and updates
- 1 completed project (100%)

### 3 Demo Meetings
- Scheduled meetings with leads
- Notes and context

### 5 Demo Invoices
- Paid, pending, and sent statuses
- Professional line items
- Total value: $170,250

## Managing Demo Users

### Create Multiple Demo Accounts

You can create multiple demo users for different clients:

```sql
-- Each new demo user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('demo-client1@example.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW());

-- Then set their role
UPDATE profiles SET role = 'demo', display_name = 'Client Demo 1'
WHERE id = (SELECT id FROM auth.users WHERE email = 'demo-client1@example.com');
```

### Change Demo User Password

```sql
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword123!', gen_salt('bf'))
WHERE email = 'demo@yourcompany.com';
```

### Delete Demo User

```sql
DELETE FROM auth.users WHERE email = 'demo@yourcompany.com';
```

## Updating Demo Data

Want to change the demo data? Edit `020_demo_data_with_isolation.sql`:

1. Modify company names, project details, deal values, etc.
2. Keep `is_demo = true` for all records
3. Delete existing demo data (optional):
   ```sql
   DELETE FROM activity_log WHERE is_demo = true;
   DELETE FROM invoices WHERE is_demo = true;
   DELETE FROM meetings WHERE is_demo = true;
   DELETE FROM deals WHERE is_demo = true;
   DELETE FROM projects WHERE is_demo = true;
   DELETE FROM leads WHERE is_demo = true;
   DELETE FROM lead_lists WHERE is_demo = true;
   DELETE FROM clients WHERE is_demo = true;
   ```
4. Re-run the updated migration

## Troubleshooting

### Demo user sees no data
- Check that the user's role is set to `'demo'` in the profiles table
- Verify demo data has `is_demo = true` flags
- Check RLS policies are enabled on all tables

### Regular users see demo data
- Check that demo data has `is_demo = true` flags
- Verify RLS policies are correctly filtering by role
- Re-run migration 019 to fix policies

### Demo user can edit data
- Demo users should be read-only by policy
- Check that INSERT/UPDATE/DELETE policies exclude demo role
- If not, re-run migration 019

## Security Notes

- Demo accounts are separate from production data
- Demo users cannot access or modify real data
- Real users cannot see demo data
- All data isolation is enforced at the database level (RLS policies)
- Even if the frontend breaks, data remains isolated

---

**Your demo environment is now permanent and always available! 🎉**
