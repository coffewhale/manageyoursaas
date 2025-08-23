-- Seed Data
-- This migration adds sample data for development and testing

-- Create a demo organization (this will be replaced when real users sign up)
INSERT INTO organizations (id, name, description) VALUES
    ('demo-org-uuid-0000-0000-000000000000', 'Demo Organization', 'Sample organization for testing');

-- Note: In a real app, profiles are created automatically via the trigger
-- This is just for demo purposes - replace with your actual user ID from Supabase Auth
-- You can get this by signing up a user and checking auth.users table

-- Demo vendors
INSERT INTO vendors (organization_id, category_id, name, website, contact_email, contact_phone, description, status) VALUES
    ('demo-org-uuid-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'Slack Technologies', 'https://slack.com', 'support@slack.com', '+1-415-555-0123', 'Team collaboration and messaging platform', 'active'),
    ('demo-org-uuid-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440002', 'GitHub', 'https://github.com', 'support@github.com', NULL, 'Code repository and collaboration platform', 'active'),
    ('demo-org-uuid-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440003', 'Figma', 'https://figma.com', 'hello@figma.com', NULL, 'Collaborative design tool', 'trial'),
    ('demo-org-uuid-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440004', 'Google Analytics', 'https://analytics.google.com', 'support@google.com', NULL, 'Web analytics service', 'active'),
    ('demo-org-uuid-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440006', 'Notion', 'https://notion.so', 'team@makenotion.com', NULL, 'All-in-one workspace for notes, tasks, wikis, and databases', 'active'),
    ('demo-org-uuid-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440007', 'LastPass', 'https://lastpass.com', 'support@lastpass.com', NULL, 'Password management solution', 'active'),
    ('demo-org-uuid-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440005', 'Mailchimp', 'https://mailchimp.com', 'support@mailchimp.com', '+1-678-999-8212', 'Email marketing platform', 'inactive');

-- Demo subscriptions
INSERT INTO subscriptions (organization_id, vendor_id, name, description, cost, currency, billing_cycle, user_seats, start_date, next_renewal_date, auto_renew, status) VALUES
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'Slack Technologies'), 'Slack Pro', 'Professional team collaboration plan', 80.00, 'USD', 'monthly', 10, '2024-01-15', '2024-12-15', true, 'active'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'Slack Technologies'), 'Slack Enterprise Grid', 'Enterprise-grade security and compliance', 150.00, 'USD', 'monthly', 25, '2024-01-15', '2024-12-15', true, 'active'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'GitHub'), 'GitHub Team', 'Team plan for private repositories', 120.00, 'USD', 'monthly', 5, '2024-02-01', '2025-02-01', true, 'active'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'Figma'), 'Figma Professional', 'Professional design tools', 45.00, 'USD', 'monthly', 3, '2024-03-01', '2024-04-01', false, 'trial'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'Google Analytics'), 'Google Analytics 360', 'Enterprise analytics solution', 150000.00, 'USD', 'yearly', 1, '2024-01-01', '2025-01-01', true, 'active'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'Notion'), 'Notion Team', 'Team collaboration workspace', 96.00, 'USD', 'monthly', 8, '2024-02-15', '2025-02-15', true, 'active'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'LastPass'), 'LastPass Business', 'Business password management', 36.00, 'USD', 'monthly', 12, '2024-01-01', '2025-01-01', true, 'active'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM vendors WHERE name = 'Mailchimp'), 'Mailchimp Standard', 'Email marketing automation', 299.00, 'USD', 'monthly', 1, '2023-06-01', '2024-06-01', false, 'inactive');

-- Demo renewal history
INSERT INTO renewals (organization_id, subscription_id, previous_cost, new_cost, renewal_date, next_renewal_date, notes) VALUES
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM subscriptions WHERE name = 'Slack Pro'), 75.00, 80.00, '2024-01-15', '2024-12-15', 'Price increased due to additional features'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM subscriptions WHERE name = 'GitHub Team'), 100.00, 120.00, '2024-02-01', '2025-02-01', 'Upgraded plan with advanced security features'),
    ('demo-org-uuid-0000-0000-000000000000', (SELECT id FROM subscriptions WHERE name = 'Notion Team'), 80.00, 96.00, '2024-02-15', '2025-02-15', 'Added 2 more users');

-- Demo activity logs
INSERT INTO activity_logs (organization_id, action, resource_type, resource_id, details) VALUES
    ('demo-org-uuid-0000-0000-000000000000', 'create', 'vendor', (SELECT id FROM vendors WHERE name = 'Slack Technologies'), '{"name": "Slack Technologies", "status": "active"}'),
    ('demo-org-uuid-0000-0000-000000000000', 'create', 'subscription', (SELECT id FROM subscriptions WHERE name = 'Slack Pro'), '{"name": "Slack Pro", "cost": 80.00}'),
    ('demo-org-uuid-0000-0000-000000000000', 'update', 'subscription', (SELECT id FROM subscriptions WHERE name = 'GitHub Team'), '{"field": "cost", "old_value": 100.00, "new_value": 120.00}'),
    ('demo-org-uuid-0000-0000-000000000000', 'create', 'vendor', (SELECT id FROM vendors WHERE name = 'Figma'), '{"name": "Figma", "status": "trial"}'),
    ('demo-org-uuid-0000-0000-000000000000', 'update', 'vendor', (SELECT id FROM vendors WHERE name = 'Mailchimp'), '{"field": "status", "old_value": "active", "new_value": "inactive"}');

-- Create views for commonly used data
CREATE OR REPLACE VIEW vendor_summary AS
SELECT 
    v.id,
    v.name,
    v.website,
    v.contact_email,
    v.status,
    c.name as category_name,
    c.color as category_color,
    COUNT(s.id) as subscription_count,
    COALESCE(SUM(
        CASE 
            WHEN s.billing_cycle = 'monthly' THEN s.cost
            WHEN s.billing_cycle = 'quarterly' THEN s.cost / 3
            WHEN s.billing_cycle = 'yearly' THEN s.cost / 12
        END
    ), 0) as monthly_cost,
    v.organization_id,
    v.created_at,
    v.updated_at
FROM vendors v
LEFT JOIN categories c ON v.category_id = c.id
LEFT JOIN subscriptions s ON v.id = s.vendor_id AND s.status = 'active'
GROUP BY v.id, v.name, v.website, v.contact_email, v.status, c.name, c.color, v.organization_id, v.created_at, v.updated_at;

-- Create view for upcoming renewals
CREATE OR REPLACE VIEW upcoming_renewals AS
SELECT 
    s.id as subscription_id,
    s.name as subscription_name,
    v.name as vendor_name,
    s.cost,
    s.currency,
    s.billing_cycle,
    s.next_renewal_date,
    s.auto_renew,
    s.organization_id,
    CASE 
        WHEN s.next_renewal_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
        WHEN s.next_renewal_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
        ELSE 'normal'
    END as urgency_level
FROM subscriptions s
JOIN vendors v ON s.vendor_id = v.id
WHERE s.status = 'active' AND s.next_renewal_date IS NOT NULL
ORDER BY s.next_renewal_date ASC;

-- Create function to calculate organization spending
CREATE OR REPLACE FUNCTION get_organization_spending(org_id uuid)
RETURNS TABLE (
    total_monthly_cost numeric,
    total_yearly_cost numeric,
    active_subscriptions bigint,
    total_vendors bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN s.billing_cycle = 'monthly' THEN s.cost
                WHEN s.billing_cycle = 'quarterly' THEN s.cost / 3
                WHEN s.billing_cycle = 'yearly' THEN s.cost / 12
            END
        ), 0) as total_monthly_cost,
        COALESCE(SUM(
            CASE 
                WHEN s.billing_cycle = 'monthly' THEN s.cost * 12
                WHEN s.billing_cycle = 'quarterly' THEN s.cost * 4
                WHEN s.billing_cycle = 'yearly' THEN s.cost
            END
        ), 0) as total_yearly_cost,
        COUNT(s.id) as active_subscriptions,
        COUNT(DISTINCT v.id) as total_vendors
    FROM subscriptions s
    JOIN vendors v ON s.vendor_id = v.id
    WHERE s.organization_id = org_id AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on views and functions
GRANT SELECT ON vendor_summary TO authenticated;
GRANT SELECT ON upcoming_renewals TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_spending(uuid) TO authenticated;