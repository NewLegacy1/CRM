-- Demo Data Migration with is_demo flag
-- This populates the CRM with sample data marked as demo data
-- Only users with role='demo' can see this data

-- Demo Clients (with is_demo flag)
INSERT INTO clients (id, name, email, phone, company, notes, created_by, is_demo, created_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'Acme Corporation', 'contact@acmecorp.com', '5551234567', 'Acme Corp', 'High-value client, interested in full website redesign', (SELECT id FROM auth.users LIMIT 1), true, NOW() - INTERVAL '30 days'),
('a2222222-2222-2222-2222-222222222222', 'TechStart Industries', 'hello@techstart.io', '5559876543', 'TechStart Inc', 'Startup looking for landing pages and funnels', (SELECT id FROM auth.users LIMIT 1), true, NOW() - INTERVAL '25 days'),
('a3333333-3333-3333-3333-333333333333', 'Global Ventures LLC', 'info@globalventures.com', '5552468135', 'Global Ventures', 'Enterprise client, multiple ongoing projects', (SELECT id FROM auth.users LIMIT 1), true, NOW() - INTERVAL '20 days'),
('a4444444-4444-4444-4444-444444444444', 'Peak Performance Coaching', 'coach@peakperformance.com', '5558675309', 'Peak Performance', 'Coaching business needs sales funnel', (SELECT id FROM auth.users LIMIT 1), true, NOW() - INTERVAL '15 days'),
('a5555555-5555-5555-5555-555555555555', 'Urban Eats Restaurant Group', 'contact@urbaneats.com', '5553141592', 'Urban Eats', 'Restaurant chain needs booking system', (SELECT id FROM auth.users LIMIT 1), true, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Demo Lead Lists (with is_demo flag)
INSERT INTO lead_lists (id, name, niche, total_count, assigned_cold_callers, is_demo, created_at) VALUES
('b1111111-1111-1111-1111-111111111111', 'Real Estate Agents - Q1 2026', 'Real Estate', 250, ARRAY[]::UUID[], true, NOW() - INTERVAL '20 days'),
('b2222222-2222-2222-2222-222222222222', 'E-commerce Stores', 'E-commerce', 180, ARRAY[]::UUID[], true, NOW() - INTERVAL '15 days'),
('b3333333-3333-3333-3333-333333333333', 'Professional Services', 'Consulting', 150, ARRAY[]::UUID[], true, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Demo Leads (with is_demo flag)
INSERT INTO leads (id, name, email, phone, niche, city, website, list_id, status, is_demo, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'Sarah Martinez', 'sarah.m@premierrealty.com', '5551112222', 'Real Estate', 'Los Angeles', 'premierrealty.com', 'b1111111-1111-1111-1111-111111111111', 'booked', true, NOW() - INTERVAL '5 days'),
('c2222222-2222-2222-2222-222222222222', 'James Chen', 'james@modernhomes.net', '5553334444', 'Real Estate', 'San Francisco', 'modernhomes.net', 'b1111111-1111-1111-1111-111111111111', 'didnt_book', true, NOW() - INTERVAL '4 days'),
('c3333333-3333-3333-3333-333333333333', 'Emily Thompson', 'emily@luxurylifestyle.shop', '5555556666', 'E-commerce', 'New York', 'luxurylifestyle.shop', 'b2222222-2222-2222-2222-222222222222', 'booked', true, NOW() - INTERVAL '3 days'),
('c4444444-4444-4444-4444-444444444444', 'Michael Rodriguez', 'mike@techgear.store', '5557778888', 'E-commerce', 'Austin', 'techgear.store', 'b2222222-2222-2222-2222-222222222222', 'new', true, NOW() - INTERVAL '2 days'),
('c5555555-5555-5555-5555-555555555555', 'Lisa Anderson', 'lisa@consultpro.com', '5559990000', 'Consulting', 'Chicago', 'consultpro.com', 'b3333333-3333-3333-3333-333333333333', 'no_answer', true, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Demo Projects (with is_demo flag)
INSERT INTO projects (id, client_id, name, status, type, progress, is_demo, created_at, urls, repos, team_members, updates) VALUES
(
  'd1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Acme Corp Website Redesign',
  'active',
  'website',
  65,
  true,
  NOW() - INTERVAL '25 days',
  ARRAY['https://acmecorp.com', 'https://staging.acmecorp.com'],
  ARRAY['https://github.com/demo/acme-website'],
  ARRAY[]::UUID[],
  ('[{"text": "Initial design mockups approved", "at": "' || (NOW() - INTERVAL '20 days')::TEXT || '"}, {"text": "Development phase started", "at": "' || (NOW() - INTERVAL '15 days')::TEXT || '"}, {"text": "Homepage and about page completed", "at": "' || (NOW() - INTERVAL '10 days')::TEXT || '"}]')::JSONB
),
(
  'd2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  'TechStart Landing Page + Funnel',
  'active',
  'funnel',
  85,
  true,
  NOW() - INTERVAL '20 days',
  ARRAY['https://techstart.io', 'https://app.techstart.io'],
  ARRAY['https://github.com/demo/techstart-funnel'],
  ARRAY[]::UUID[],
  ('[{"text": "Landing page live and converting", "at": "' || (NOW() - INTERVAL '15 days')::TEXT || '"}, {"text": "Email automation setup complete", "at": "' || (NOW() - INTERVAL '10 days')::TEXT || '"}, {"text": "A/B testing showing 3.2% conversion rate", "at": "' || (NOW() - INTERVAL '5 days')::TEXT || '"}]')::JSONB
),
(
  'd3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  'Peak Performance Sales Funnel',
  'active',
  'funnel',
  40,
  true,
  NOW() - INTERVAL '10 days',
  ARRAY['https://peakperformance.com/apply'],
  ARRAY[]::TEXT[],
  ARRAY[]::UUID[],
  ('[{"text": "Funnel strategy finalized", "at": "' || (NOW() - INTERVAL '8 days')::TEXT || '"}, {"text": "Landing page in development", "at": "' || (NOW() - INTERVAL '5 days')::TEXT || '"}]')::JSONB
),
(
  'd4444444-4444-4444-4444-444444444444',
  'a5555555-5555-5555-5555-555555555555',
  'Urban Eats Reservation System',
  'active',
  'website',
  30,
  true,
  NOW() - INTERVAL '8 days',
  ARRAY['https://urbaneats.com'],
  ARRAY[]::TEXT[],
  ARRAY[]::UUID[],
  ('[{"text": "Requirements gathering completed", "at": "' || (NOW() - INTERVAL '7 days')::TEXT || '"}, {"text": "Wireframes approved", "at": "' || (NOW() - INTERVAL '4 days')::TEXT || '"}]')::JSONB
),
(
  'd5555555-5555-5555-5555-555555555555',
  'a3333333-3333-3333-3333-333333333333',
  'Global Ventures Corporate Portal',
  'completed',
  'website',
  100,
  true,
  NOW() - INTERVAL '60 days',
  ARRAY['https://globalventures.com', 'https://portal.globalventures.com'],
  ARRAY['https://github.com/demo/gv-portal'],
  ARRAY[]::UUID[],
  ('[{"text": "Portal launched successfully", "at": "' || (NOW() - INTERVAL '30 days')::TEXT || '"}, {"text": "Training sessions completed", "at": "' || (NOW() - INTERVAL '25 days')::TEXT || '"}, {"text": "Project marked complete", "at": "' || (NOW() - INTERVAL '20 days')::TEXT || '"}]')::JSONB
)
ON CONFLICT (id) DO NOTHING;

-- Demo Deals (with is_demo flag)
INSERT INTO deals (id, client_id, name, value, min_value, max_value, stage, is_demo, created_at) VALUES
('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Acme Website Project', 35000.00, 30000.00, 40000.00, 'negotiation', true, NOW() - INTERVAL '25 days'),
('e2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'TechStart Funnel Deal', 12500.00, 10000.00, 15000.00, 'closed_won', true, NOW() - INTERVAL '20 days'),
('e3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'Peak Performance Package', 8500.00, 7000.00, 10000.00, 'proposal', true, NOW() - INTERVAL '10 days'),
('e4444444-4444-4444-4444-444444444444', 'a5555555-5555-5555-5555-555555555555', 'Urban Eats Booking System', 22000.00, 20000.00, 25000.00, 'qualification', true, NOW() - INTERVAL '8 days'),
('e5555555-5555-5555-5555-555555555555', 'a3333333-3333-3333-3333-333333333333', 'Global Ventures Portal', 125000.00, 100000.00, 150000.00, 'closed_won', true, NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO NOTHING;

-- Demo Ads (for analytics)
INSERT INTO ads (id, client_id, name, platform, spend, revenue, status, is_demo, created_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Acme Q1 Meta Ads', 'meta', 4200.00, 12600.00, 'active', true, NOW() - INTERVAL '20 days'),
('f2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'TechStart Google Search', 'google', 3100.00, 9300.00, 'active', true, NOW() - INTERVAL '18 days'),
('f3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'Peak Performance Meta', 'meta', 1500.00, 4200.00, 'active', true, NOW() - INTERVAL '12 days'),
('f4444444-4444-4444-4444-444444444444', 'a5555555-5555-5555-5555-555555555555', 'Urban Eats Local Ads', 'google', 900.00, 2700.00, 'active', true, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Demo Agency Ads (agency overview)
INSERT INTO agency_ads (id, platform, campaign_name, campaign_id, spend, impressions, clicks, conversions, synced_at, is_demo, created_at) VALUES
('f5555555-5555-5555-5555-555555555555', 'meta', 'Acme Retargeting', 'camp_001', 2800.00, 145000, 4200, 120.00, NOW() - INTERVAL '2 days', true, NOW() - INTERVAL '20 days'),
('f6666666-6666-6666-6666-666666666666', 'google', 'TechStart Search', 'camp_002', 2300.00, 98000, 3100, 95.00, NOW() - INTERVAL '3 days', true, NOW() - INTERVAL '18 days'),
('f7777777-7777-7777-7777-777777777777', 'meta', 'Peak Performance Leads', 'camp_003', 1200.00, 56000, 1700, 60.00, NOW() - INTERVAL '1 day', true, NOW() - INTERVAL '12 days')
ON CONFLICT (id) DO NOTHING;

-- Demo AI Insights
INSERT INTO ai_insights (id, date, summary, actionable_items, is_demo, created_at) VALUES
('f8888888-8888-8888-8888-888888888888', (CURRENT_DATE - INTERVAL '2 days')::date, 'Ad spend efficiency improved this week. Meta campaigns show strong ROAS while Google search is stable. Cold calling booking rate rose slightly.', '["Prioritize top Meta creatives with ROAS > 3x","Increase daily Meta budget by 10%","Follow up on unbooked leads within 24 hours"]'::jsonb, true, NOW() - INTERVAL '2 days'),
('f9999999-9999-9999-9999-999999999999', (CURRENT_DATE - INTERVAL '1 day')::date, 'Pipeline velocity increased with two deals moving to negotiation. Average deal value increased due to larger enterprise opportunities.', '["Review negotiation notes for Acme Corp","Send updated proposal to Peak Performance","Schedule QBR with Global Ventures"]'::jsonb, true, NOW() - INTERVAL '1 day'),
('f0000000-0000-0000-0000-000000000001', CURRENT_DATE, 'Meetings booked from cold calls are trending upward. Emails with short subject lines are getting higher response rates.', '["A/B test subject lines under 6 words","Block 2 hours daily for call follow-ups","Add CTA to booking emails"]'::jsonb, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo Meetings (with is_demo flag)
INSERT INTO meetings (id, lead_id, scheduled_at, booked_by, source, notes, is_demo, created_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', NOW() + INTERVAL '2 days', (SELECT id FROM auth.users LIMIT 1), 'cold_call', 'Interested in complete website redesign', true, NOW() - INTERVAL '5 days'),
('f2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', NOW() + INTERVAL '3 days', (SELECT id FROM auth.users LIMIT 1), 'cold_call', 'Wants to discuss e-commerce optimization', true, NOW() - INTERVAL '3 days'),
('f3333333-3333-3333-3333-333333333333', NULL, NOW() + INTERVAL '5 days', (SELECT id FROM auth.users LIMIT 1), 'website', 'Inbound lead from website contact form', true, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Demo Invoices (with is_demo flag)
INSERT INTO invoices (id, client_id, created_by, status, currency, amount_total, amount_due, due_date, line_items, memo, is_demo, created_at) VALUES
(
  'a0000001-0001-0001-0001-000000000001',
  'a1111111-1111-1111-1111-111111111111',
  (SELECT id FROM auth.users LIMIT 1),
  'paid',
  'USD',
  17500.00,
  0.00,
  NOW() - INTERVAL '5 days',
  '[{"description": "Website Design - Phase 1", "quantity": 1, "unit_amount": 10000.00, "amount": 10000.00}, {"description": "Frontend Development", "quantity": 50, "unit_amount": 150.00, "amount": 7500.00}]'::JSONB,
  'Initial payment for Acme Corp website redesign project',
  true,
  NOW() - INTERVAL '20 days'
),
(
  'a0000002-0002-0002-0002-000000000002',
  'a2222222-2222-2222-2222-222222222222',
  (SELECT id FROM auth.users LIMIT 1),
  'paid',
  'USD',
  12500.00,
  0.00,
  NOW() - INTERVAL '10 days',
  '[{"description": "Landing Page Design & Development", "quantity": 1, "unit_amount": 5000.00, "amount": 5000.00}, {"description": "Sales Funnel Setup", "quantity": 1, "unit_amount": 4500.00, "amount": 4500.00}, {"description": "Email Automation Integration", "quantity": 1, "unit_amount": 3000.00, "amount": 3000.00}]'::JSONB,
  'TechStart funnel project - Full payment',
  true,
  NOW() - INTERVAL '18 days'
),
(
  'a0000003-0003-0003-0003-000000000003',
  'a3333333-3333-3333-3333-333333333333',
  (SELECT id FROM auth.users LIMIT 1),
  'paid',
  'USD',
  125000.00,
  0.00,
  NOW() - INTERVAL '30 days',
  '[{"description": "Enterprise Portal Development", "quantity": 1, "unit_amount": 85000.00, "amount": 85000.00}, {"description": "Custom Authentication System", "quantity": 1, "unit_amount": 20000.00, "amount": 20000.00}, {"description": "Training & Documentation", "quantity": 1, "unit_amount": 12000.00, "amount": 12000.00}, {"description": "3 Months Premium Support", "quantity": 1, "unit_amount": 8000.00, "amount": 8000.00}]'::JSONB,
  'Global Ventures corporate portal - Final invoice',
  true,
  NOW() - INTERVAL '35 days'
),
(
  'a0000004-0004-0004-0004-000000000004',
  'a5555555-5555-5555-5555-555555555555',
  (SELECT id FROM auth.users LIMIT 1),
  'sent',
  'USD',
  11000.00,
  11000.00,
  NOW() + INTERVAL '15 days',
  '[{"description": "Reservation System - Initial Deposit", "quantity": 1, "unit_amount": 11000.00, "amount": 11000.00}]'::JSONB,
  '50% deposit for Urban Eats reservation system',
  true,
  NOW() - INTERVAL '3 days'
),
(
  'a0000005-0005-0005-0005-000000000005',
  'a4444444-4444-4444-4444-444444444444',
  (SELECT id FROM auth.users LIMIT 1),
  'pending',
  'USD',
  4250.00,
  4250.00,
  NOW() + INTERVAL '7 days',
  '[{"description": "Sales Funnel Strategy & Design", "quantity": 1, "unit_amount": 4250.00, "amount": 4250.00}]'::JSONB,
  'Initial payment for Peak Performance sales funnel - 50% deposit',
  true,
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- Demo Activity Log entries (with is_demo flag)
INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, is_demo, created_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'created',
  'project',
  'd1111111-1111-1111-1111-111111111111',
  '{"project_name": "Acme Corp Website Redesign"}',
  true,
  NOW() - INTERVAL '25 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, is_demo, created_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'created',
  'deal',
  'e1111111-1111-1111-1111-111111111111',
  '{"deal_name": "Acme Website Project", "value": 35000}',
  true,
  NOW() - INTERVAL '25 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, is_demo, created_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'status_change',
  'invoice',
  'a0000001-0001-0001-0001-000000000001',
  '{"status": "paid", "amount": 17500}',
  true,
  NOW() - INTERVAL '15 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Demo data successfully loaded with is_demo=true flag!';
  RAISE NOTICE '📊 Added: 5 clients, 5 leads, 5 projects, 5 deals, 4 ads, 3 agency ads, 3 AI insights, 3 meetings, 5 invoices';
  RAISE NOTICE '🔒 Only users with role="demo" can see this data';
  RAISE NOTICE '👤 Next: Create a demo user and set their profile role to "demo"';
END $$;
