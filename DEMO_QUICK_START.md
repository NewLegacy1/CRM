# ⚡ Demo Quick Start (2 Minutes)

Super fast guide to get your demo running!

## Step 1: Run Migrations (1 minute)

Go to **Supabase Dashboard → SQL Editor**, copy/paste and run each:

```sql
-- 1. Copy/paste 016_add_deal_project_enhancements.sql → Run
-- 2. Copy/paste 019_demo_role_and_isolation.sql → Run  
-- 3. Copy/paste 021_add_demo_role_to_profiles.sql → Run
-- 4. Copy/paste 020_demo_data_with_isolation.sql → Run
```

## Step 2: Create Demo User (1 minute)

### Quick Method:
1. **Supabase Dashboard → Authentication → Users**
2. Click **Add user** → **Create new user**
3. Email: `demo@yourcompany.com`
4. Password: `DemoPass123!` (or your choice)
5. ✅ Check **Auto Confirm User**
6. Click **Create user**
7. **Copy the user UUID** (long string like `123e4567-e89b...`)

### Set Role to Demo:
Go back to **SQL Editor** and run:

```sql
-- Replace USER_UUID with the UUID you copied
UPDATE profiles 
SET role = 'demo', display_name = 'Demo User'
WHERE id = 'USER_UUID_HERE';

-- If that doesn't work, create the profile:
INSERT INTO profiles (id, role, display_name)
VALUES ('USER_UUID_HERE', 'demo', 'Demo User')
ON CONFLICT (id) DO UPDATE SET role = 'demo';
```

## Step 3: Test It! (30 seconds)

1. Log out of your CRM
2. Log in with: `demo@yourcompany.com` / `DemoPass123!`
3. See all the demo data! ✨

## What You Get

- 5 demo clients (Acme Corp, TechStart, etc.)
- 5 demo projects (30%-100% complete)
- 5 demo deals ($8.5K - $125K)
- 5 demo invoices
- 3 demo meetings
- Demo lead lists with leads

## Key Points

✅ Demo users **only** see demo data
✅ Real users **never** see demo data  
✅ Data isolation enforced at database level
✅ Demo environment is **permanent** (no cleanup needed)

## Share with Your Client

Email: `demo@yourcompany.com`  
Password: `DemoPass123!`  
URL: Your CRM URL

They can explore safely - can't see or affect real data!

---

**Done! Ready to film your demo! 🎥**

For more details, see:
- **DEMO_USER_SETUP.md** - Full setup guide
- **DEMO_CHECKLIST.md** - Pre-recording checklist
- **DEMO_SETUP.md** - Complete documentation
