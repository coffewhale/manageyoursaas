-- Row Level Security (RLS) Policies
-- This migration enables RLS and creates security policies for multi-tenant access control

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

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

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Organization owners and admins can update their organization" ON organizations
    FOR UPDATE USING (
        id = get_user_organization_id(auth.uid()) AND 
        is_user_admin(auth.uid())
    );

-- Profiles policies
CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid()) OR
        id = auth.uid()
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can update profiles in their organization" ON profiles
    FOR UPDATE USING (
        organization_id = get_user_organization_id(auth.uid()) AND
        is_user_admin(auth.uid())
    );

CREATE POLICY "New users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Categories policies
CREATE POLICY "Users can view categories in their organization" ON categories
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Admins can manage categories in their organization" ON categories
    FOR ALL USING (
        organization_id = get_user_organization_id(auth.uid()) AND
        is_user_admin(auth.uid())
    );

-- Vendors policies
CREATE POLICY "Users can view vendors in their organization" ON vendors
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can create vendors in their organization" ON vendors
    FOR INSERT WITH CHECK (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can update vendors in their organization" ON vendors
    FOR UPDATE USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Admins can delete vendors in their organization" ON vendors
    FOR DELETE USING (
        organization_id = get_user_organization_id(auth.uid()) AND
        is_user_admin(auth.uid())
    );

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions in their organization" ON subscriptions
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can create subscriptions in their organization" ON subscriptions
    FOR INSERT WITH CHECK (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can update subscriptions in their organization" ON subscriptions
    FOR UPDATE USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Admins can delete subscriptions in their organization" ON subscriptions
    FOR DELETE USING (
        organization_id = get_user_organization_id(auth.uid()) AND
        is_user_admin(auth.uid())
    );

-- Documents policies
CREATE POLICY "Users can view documents in their organization" ON documents
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can upload documents in their organization" ON documents
    FOR INSERT WITH CHECK (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can update documents they uploaded or admins can update any" ON documents
    FOR UPDATE USING (
        organization_id = get_user_organization_id(auth.uid()) AND
        (uploaded_by = auth.uid() OR is_user_admin(auth.uid()))
    );

CREATE POLICY "Users can delete documents they uploaded or admins can delete any" ON documents
    FOR DELETE USING (
        organization_id = get_user_organization_id(auth.uid()) AND
        (uploaded_by = auth.uid() OR is_user_admin(auth.uid()))
    );

-- Renewals policies
CREATE POLICY "Users can view renewals in their organization" ON renewals
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can create renewals in their organization" ON renewals
    FOR INSERT WITH CHECK (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Admins can update renewals in their organization" ON renewals
    FOR UPDATE USING (
        organization_id = get_user_organization_id(auth.uid()) AND
        is_user_admin(auth.uid())
    );

-- Activity logs policies
CREATE POLICY "Users can view activity logs in their organization" ON activity_logs
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a function to initialize a new organization for a user
CREATE OR REPLACE FUNCTION initialize_user_organization(
    org_name text DEFAULT 'My Organization',
    user_full_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_org_id uuid;
    user_profile_exists boolean;
BEGIN
    -- Check if user profile already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()) INTO user_profile_exists;
    
    IF user_profile_exists THEN
        RAISE EXCEPTION 'User already has a profile and organization';
    END IF;

    -- Create new organization
    INSERT INTO organizations (name, description)
    VALUES (org_name, 'Created automatically for ' || COALESCE(user_full_name, auth.email()))
    RETURNING id INTO new_org_id;

    -- Update user profile with organization
    UPDATE profiles 
    SET 
        organization_id = new_org_id,
        role = 'owner',
        full_name = COALESCE(user_full_name, full_name)
    WHERE id = auth.uid();

    -- Log the organization creation
    INSERT INTO activity_logs (organization_id, user_id, action, resource_type, resource_id, details)
    VALUES (
        new_org_id,
        auth.uid(),
        'create',
        'organization',
        new_org_id,
        jsonb_build_object('name', org_name)
    );

    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;