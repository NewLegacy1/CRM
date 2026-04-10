-- Migration 030: Marketing site tables
-- Creates tables for lead/intake form submissions from the public marketing site.
-- These feed into the CRM from newlegacyai.ca forms.

-- Quick lead capture form (homepage modal, niche pages)
CREATE TABLE IF NOT EXISTS lead_submissions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website_url TEXT,
  services_interested TEXT[],
  message TEXT,
  preferred_contact TEXT,
  source_path TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'new'
);

-- Website build intake form (/site-intake)
CREATE TABLE IF NOT EXISTS intake_submissions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  timezone TEXT NOT NULL,
  payload JSONB NOT NULL
);

-- CRM onboarding intake form (/crm-intake)
CREATE TABLE IF NOT EXISTS crm_intake_submissions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  business_name TEXT NOT NULL,
  primary_contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  payload JSONB NOT NULL
);

-- Storage bucket for logo and portfolio uploads from intake forms.
-- Run in Supabase dashboard: Storage > New bucket > "intake-uploads" > Public
-- Or via Supabase CLI: supabase storage create intake-uploads --public
