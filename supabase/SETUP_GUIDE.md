# Day 2 — Supabase Setup Guide
## Happy Event Planner | Lahore, Pakistan

---

## STEP 1 — Create Your Supabase Project

1. Go to https://supabase.com and click **"Start your project"**
2. Sign up with GitHub (recommended) or email
3. Click **"New Project"**
4. Fill in:
   - **Organization:** Create new → "Happy Event Planner"
   - **Project name:** `happy-event-planner`
   - **Database password:** Create a STRONG password — save it somewhere safe!
   - **Region:** Southeast Asia (Singapore) — closest to Pakistan
5. Click **"Create new project"** — wait ~2 minutes for setup

---

## STEP 2 — Run the SQL Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file: `supabase/migrations/001_initial_schema.sql`
4. Copy ALL the SQL and paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: **"Success. No rows returned"**

This creates all 8 tables:
- ✅ categories
- ✅ products
- ✅ customers
- ✅ orders
- ✅ order_items
- ✅ payments
- ✅ reviews
- ✅ inventory_log

---

## STEP 3 — Get Your API Keys

1. In Supabase dashboard, click **"Project Settings"** (gear icon, bottom left)
2. Click **"API"**
3. Copy these two values:

| Key | Where to find it |
|-----|-----------------|
| Project URL | Under "Project URL" |
| anon public key | Under "Project API keys" → anon public |
| service_role key | Under "Project API keys" → service_role ⚠️ NEVER expose publicly |

---

## STEP 4 — Update Your .env.local

Open `.env.local` in the project and replace the placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## STEP 5 — Verify Tables in Supabase

1. Click **"Table Editor"** in the left sidebar
2. You should see all 8 tables listed
3. Click on **"categories"** — you should see 5 starter categories already inserted:
   - Balloons
   - Candles
   - Paper Decor
   - Party Packages
   - Custom Orders
4. Click on **"products"** — you should see 5 sample products

---

## STEP 6 — Enable Supabase Authentication (for customers)

1. Click **"Authentication"** in the left sidebar
2. Click **"Providers"**
3. Enable **"Email"** provider (on by default)
4. Under Settings → turn OFF "Confirm email" for now (easier testing)
5. Optionally enable **"Phone"** provider for Pakistani mobile login

---

## STEP 7 — Add to Vercel Environment Variables

When you deploy to Vercel:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add all three Supabase variables (URL, anon key, service role key)
3. Redeploy

---

## ✅ Day 2 Checklist

- [ ] Supabase project created
- [ ] SQL migration run successfully
- [ ] All 8 tables visible in Table Editor
- [ ] Seed data visible (5 categories, 5 products)
- [ ] API keys copied to .env.local
- [ ] RLS enabled on all tables (verify: Table Editor → click table → RLS tab)
- [ ] Authentication configured

---

## Troubleshooting

**"relation already exists" error** → Safe to ignore, table was already created

**"permission denied" error** → Make sure you're logged in as the project owner

**Products not showing** → Check RLS policy: products with status='active' are public

**Can't see tables** → Refresh the page and check you're in the right project
