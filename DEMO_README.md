# 🎭 Demo Environment Documentation

Complete guide to the isolated demo environment for your CRM.

## 📚 Documentation Overview

| File | Description | Use When |
|------|-------------|----------|
| **[DEMO_QUICK_START.md](./DEMO_QUICK_START.md)** | ⚡ 2-minute setup guide | First time setting up demo |
| **[DEMO_USER_SETUP.md](./DEMO_USER_SETUP.md)** | 👤 Detailed user & role setup | Need step-by-step instructions |
| **[DEMO_CHECKLIST.md](./DEMO_CHECKLIST.md)** | ✅ Pre-recording checklist | About to film a demo |
| **[DEMO_SETUP.md](./DEMO_SETUP.md)** | 📖 Complete documentation | Need full technical details |

## 🎯 What Is This?

A **permanent demo environment** where:
- Demo users only see demo data
- Real users never see demo data
- Complete data isolation at database level
- No cleanup needed after demos

## 🚀 Getting Started

**New to this?** Start here:
1. Read [DEMO_QUICK_START.md](./DEMO_QUICK_START.md) (2 minutes)
2. Follow the steps to set up migrations and demo user
3. Test by logging in with demo credentials

**About to film?** Use [DEMO_CHECKLIST.md](./DEMO_CHECKLIST.md)

**Need more details?** See [DEMO_USER_SETUP.md](./DEMO_USER_SETUP.md)

## 🔐 How It Works

### Architecture
```
┌─────────────────────┐
│   Demo User Login   │
│   role = 'demo'     │
└──────────┬──────────┘
           │
           ├─── RLS Policies ───┐
           │                    │
           ↓                    ↓
    ┌─────────────┐      ┌─────────────┐
    │  Demo Data  │      │  Real Data  │
    │ is_demo=true│      │is_demo=false│
    └─────────────┘      └─────────────┘
           ↑                    ↑
           │                    │
    Demo users only      Real users only
```

### Key Features
- **Row Level Security (RLS)**: Database-enforced isolation
- **Role-based filtering**: Data shown based on user role
- **is_demo flag**: All demo data tagged with `is_demo = true`
- **Read-only demo**: Demo users can't modify any data

## 📊 Demo Data Included

- **5 Clients**: Acme Corp, TechStart, Global Ventures, Peak Performance, Urban Eats
- **5 Projects**: Various stages (30% - 100% complete) with URLs, repos, team members
- **5 Deals**: $8.5K - $125K with value ranges
- **3 Meetings**: Scheduled with leads
- **5 Invoices**: Paid, pending, and sent ($170K total)
- **Lead Lists**: 3 lists with real estate, e-commerce, consulting leads

## 🎬 Demo Workflow

### For Recording
1. Log in with demo account
2. Navigate through CRM showing features
3. All data looks real and professional
4. Log out when done (data persists)

### For Client Exploration
Share demo credentials:
- Email: `demo@yourcompany.com`
- Password: (your chosen password)
- They can click around safely

## 🛠️ Migrations

Located in `supabase/migrations/`:

| Migration | Purpose |
|-----------|---------|
| `016_add_deal_project_enhancements.sql` | Adds value ranges to deals, project enhancements |
| `019_demo_role_and_isolation.sql` | Creates demo role and RLS policies |
| `021_add_demo_role_to_profiles.sql` | Adds 'demo' to profiles role constraint |
| `020_demo_data_with_isolation.sql` | Loads demo data with is_demo flags |

## ✨ Benefits

### For Demos
- ✅ Always ready - no setup needed
- ✅ Professional, realistic data
- ✅ No risk to real data
- ✅ Can share access with clients

### For Development
- ✅ Test features with realistic data
- ✅ No cleanup scripts needed
- ✅ Permanent test environment
- ✅ Isolated from production

## 🔧 Maintenance

### Update Demo Data
1. Edit `020_demo_data_with_isolation.sql`
2. Delete old demo data: `DELETE FROM clients WHERE is_demo = true;` (etc.)
3. Re-run the migration

### Create Additional Demo Users
```sql
-- Create user in Supabase Auth, then:
UPDATE profiles SET role = 'demo' 
WHERE id = 'NEW_USER_UUID';
```

### Remove Demo Environment
```sql
-- Delete all demo data
DELETE FROM activity_log WHERE is_demo = true;
DELETE FROM invoices WHERE is_demo = true;
DELETE FROM meetings WHERE is_demo = true;
DELETE FROM deals WHERE is_demo = true;
DELETE FROM projects WHERE is_demo = true;
DELETE FROM leads WHERE is_demo = true;
DELETE FROM lead_lists WHERE is_demo = true;
DELETE FROM clients WHERE is_demo = true;
```

## 🆘 Troubleshooting

**Demo user sees no data?**
- Check role is set to `'demo'` in profiles table
- Verify migrations ran successfully

**Real users see demo data?**
- Check demo data has `is_demo = true`
- Re-run migration 019 to fix RLS policies

**Demo user can edit data?**
- Re-run migration 019 (should be read-only)

More help: See [DEMO_USER_SETUP.md](./DEMO_USER_SETUP.md) troubleshooting section

## 📞 Quick Reference

### Demo Login (default)
- Email: `demo@yourcompany.com`
- Password: (you set this)

### View Current Demo Users
```sql
SELECT p.id, u.email, p.role, p.display_name
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'demo';
```

### Count Demo Data
```sql
SELECT 
  (SELECT COUNT(*) FROM clients WHERE is_demo = true) as clients,
  (SELECT COUNT(*) FROM projects WHERE is_demo = true) as projects,
  (SELECT COUNT(*) FROM deals WHERE is_demo = true) as deals,
  (SELECT COUNT(*) FROM invoices WHERE is_demo = true) as invoices;
```

---

## 🎉 Ready to Demo!

Your CRM now has a professional, permanent demo environment that's always ready to show off to clients!

Start with: **[DEMO_QUICK_START.md](./DEMO_QUICK_START.md)** →
