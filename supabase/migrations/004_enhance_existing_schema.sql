-- Enhancement Migration for Existing Schema
-- This adds missing features to your current database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (these will make your data more consistent)
DO $$ BEGIN
    CREATE TYPE vendor_status AS ENUM ('active', 'inactive', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('contract', 'amendment', 'invoice', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to existing tables (only if they don't exist)

-- Add role column to profiles if it doesn't exist
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'member';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add color column to categories if it doesn't exist  
DO $$ BEGIN
    ALTER TABLE categories ADD COLUMN color text DEFAULT '#6366f1';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add missing columns to subscriptions if they don't exist
DO $$ BEGIN
    ALTER TABLE subscriptions ADD COLUMN currency text DEFAULT 'USD';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE subscriptions ADD COLUMN user_seats integer DEFAULT 1;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE subscriptions ADD COLUMN auto_renew boolean DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE subscriptions ADD COLUMN notes text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add missing columns to documents if they don't exist
DO $$ BEGIN
    ALTER TABLE documents ADD COLUMN file_size integer;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE documents ADD COLUMN mime_type text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    details jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on activity_logs if not already enabled
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Add performance indexes (skip if they already exist)
DO $$ BEGIN
    CREATE INDEX CONCURRENTLY idx_profiles_organization_id ON profiles(organization_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX CONCURRENTLY idx_categories_organization_id ON categories(organization_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX CONCURRENTLY idx_vendors_organization_id ON vendors(organization_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX CONCURRENTLY idx_vendors_category_id ON vendors(category_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX CONCURRENTLY idx_subscriptions_organization_id ON subscriptions(organization_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX CONCURRENTLY idx_subscriptions_vendor_id ON subscriptions(vendor_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX CONCURRENTLY idx_subscriptions_next_renewal_date ON subscriptions(next_renewal_date);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Functions for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at (skip if they exist)
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id uuid)
RETURNS uuid AS $$
BEGIN
    RETURN (
        SELECT organization_id 
        FROM profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has admin role
CREATE OR REPLACE FUNCTION is_user_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT role IN ('owner', 'admin') 
        FROM profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for activity_logs
DROP POLICY IF EXISTS "Users can view activity logs in their organization" ON activity_logs;
CREATE POLICY "Users can view activity logs in their organization" ON activity_logs
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;
CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Create helpful views
CREATE OR REPLACE VIEW vendor_summary AS
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
            ELSE s.cost -- fallback for text values
        END
    ), 0) as monthly_cost,
    v.organization_id,
    v.created_at,
    v.updated_at
FROM vendors v
LEFT JOIN categories c ON v.category_id = c.id
LEFT JOIN subscriptions s ON v.id = s.vendor_id AND s.status IN ('active', 'trial')
GROUP BY v.id, v.name, v.website, v.contact_email, v.status, c.name, c.color, v.organization_id, v.created_at, v.updated_at;

-- Create view for upcoming renewals
CREATE OR REPLACE VIEW upcoming_renewals AS
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
                ELSE s.cost -- fallback
            END
        ), 0) as total_monthly_cost,
        COALESCE(SUM(
            CASE 
                WHEN s.billing_cycle = 'monthly' THEN s.cost * 12
                WHEN s.billing_cycle = 'quarterly' THEN s.cost * 4
                WHEN s.billing_cycle = 'yearly' THEN s.cost
                ELSE s.cost * 12 -- fallback
            END
        ), 0) as total_yearly_cost,
        COUNT(s.id) as active_subscriptions,
        COUNT(DISTINCT v.id) as total_vendors
    FROM subscriptions s
    JOIN vendors v ON s.vendor_id = v.id
    WHERE s.organization_id = org_id AND s.status IN ('active', 'trial');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON vendor_summary TO authenticated;
GRANT SELECT ON upcoming_renewals TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_spending(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organization_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(uuid) TO authenticated;