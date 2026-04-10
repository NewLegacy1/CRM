# 🎬 Demo Environment Setup

This guide explains the **isolated demo environment** where demo users only see demo data.

## 🔐 New Approach: Demo Role with Data Isolation

Instead of loading/removing demo data, this CRM has a **permanent demo environment**:

- **Demo users** only see demo data
- **Real users** never see demo data
- **Complete isolation** at the database level
- **Always available** - no cleanup needed

## Quick Setup (5 minutes)

### Step 1: Run Migrations

In Supabase Dashboard SQL Editor, run these in order:

```sql
-- 1. Run: 016_add_deal_project_enhancements.sql
-- 2. Run: 019_demo_role_and_isolation.sql  (creates demo role + RLS policies)
-- 3. Run: 021_add_demo_role_to_profiles.sql (adds 'demo' to profiles role constraint)
-- 4. Run: 020_demo_data_with_isolation.sql (loads demo data)
```

### Step 2: Create Demo User

See **[DEMO_USER_SETUP.md](./DEMO_USER_SETUP.md)** for detailed instructions.

**Quick version:**
1. Create user in Supabase Auth Dashboard
2. Set their role to `'demo'` in the profiles table
3. Log in with demo credentials to see demo data

### Step 3: Demo Ready! 🎉

Demo users now see:
- **5 Demo Clients** (Acme Corp, TechStart, Global Ventures, etc.)
- **5 Demo Leads** across 3 lead lists
- **5 Demo Projects** with varying progress (30% - 100%)
- **5 Demo Deals** ($8.5K - $125K with min/max values)
- **3 Demo Meetings** scheduled
- **5 Demo Invoices** (paid, pending, sent)

## How It Works

### Data Isolation
- All demo data has `is_demo = true` flag
- RLS policies filter data based on user role
- Demo users: see only `is_demo = true` records
- Other users: see only `is_demo = false/null` records

### Demo User Capabilities
✅ **Can view** all pages and demo data
❌ **Cannot** create, edit, or delete data
❌ **Cannot** see real production data

### Real User Experience
✅ See all real production data
❌ Never see demo data (completely hidden)

## What's Included

### 📊 Dashboard
- Revenue metrics ($137.5K total)
- Active projects with progress
- Upcoming meetings
- Recent activity

### 👥 Clients
- 5 companies with formatted phone numbers
- Professional contact info

### 📞 Cold Calling
- 3 lead lists ready to call
- New meeting button (links to Calendly)
- Previous lead navigation
- Delete button

### 🤝 Deals
- Various stages (qualification → closed_won)
- Value ranges (min/max estimates)
- Linked to clients

### 📁 Projects
- **Clickable** projects → full detail page
- URLs, GitHub repos
- Team member assignments
- Linked invoices
- Internal communications
- Progress tracking

### 📅 Meetings
- Scheduled with leads
- Notes and context

### 💰 Invoices
- Paid, pending, sent statuses
- Professional line items

## Demo Presentation Tips

1. **Dashboard** → Overview metrics
2. **Projects** → Click "Acme Corp Website" to show detailed page
3. **Deals** → Show value ranges
4. **Cold Calling** → Demo new features (meeting button, previous, delete)
5. **Invoices** → Professional invoicing

## Sharing with Clients

Give them the demo login credentials:
- They can explore freely
- No risk to your real data
- Permanent access (doesn't expire)

See **[DEMO_USER_SETUP.md](./DEMO_USER_SETUP.md)** for details.

## Customization

Edit `020_demo_data_with_isolation.sql`:
- Change company names
- Adjust values and progress
- Keep `is_demo = true` for all records
- Re-run the migration

---

**Good luck with your demo! 🚀**
