-- Security fix for existing views only

-- Drop and recreate vendor_summary view with security barrier
DROP VIEW IF EXISTS vendor_summary;
CREATE VIEW vendor_summary 
WITH (security_barrier = true) AS
SELECT 
    v.id,
    v.name,
    v.website,
    v.contact_email,
    v.status,
    c.name as category_name,
    COALESCE(c.color, '#6366f1') as category_color,
    COUNT(s.id) as subscription_count,
    COALESCE(SUM(
        CASE 
            WHEN s.billing_cycle = 'monthly' THEN s.cost
            WHEN s.billing_cycle = 'quarterly' THEN s.cost / 3
            WHEN s.billing_cycle = 'yearly' THEN s.cost / 12
            ELSE s.cost
        END
    ), 0) as monthly_cost,
    v.organization_id,
    v.created_at,
    v.updated_at
FROM vendors v
LEFT JOIN categories c ON v.category_id = c.id
LEFT JOIN subscriptions s ON v.id = s.vendor_id AND s.status IN ('active', 'trial')
GROUP BY v.id, v.name, v.website, v.contact_email, v.status, c.name, c.color, v.organization_id, v.created_at, v.updated_at;

-- Drop and recreate upcoming_renewals view with security barrier
DROP VIEW IF EXISTS upcoming_renewals;
CREATE VIEW upcoming_renewals 
WITH (security_barrier = true) AS
SELECT 
    s.id as subscription_id,
    s.name as subscription_name,
    v.name as vendor_name,
    s.cost,
    COALESCE(s.currency, 'USD') as currency,
    s.billing_cycle,
    s.next_renewal_date,
    COALESCE(s.auto_renew, true) as auto_renew,
    s.organization_id,
    CASE 
        WHEN s.next_renewal_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
        WHEN s.next_renewal_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
        ELSE 'normal'
    END as urgency_level
FROM subscriptions s
JOIN vendors v ON s.vendor_id = v.id
WHERE s.status IN ('active', 'trial') AND s.next_renewal_date IS NOT NULL
ORDER BY s.next_renewal_date ASC;

-- Enable RLS on views
ALTER VIEW vendor_summary ENABLE ROW LEVEL SECURITY;
ALTER VIEW upcoming_renewals ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON vendor_summary TO authenticated;
GRANT SELECT ON upcoming_renewals TO authenticated;