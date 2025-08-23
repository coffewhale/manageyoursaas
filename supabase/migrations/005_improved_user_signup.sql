-- Enhanced user signup flow with organization creation
-- This migration improves the user profile creation to automatically set up organizations

-- Drop the existing function and recreate it with organization support
DROP FUNCTION IF EXISTS create_user_profile();

-- Enhanced function to create user profile with organization
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id uuid;
    org_name text;
    user_full_name text;
BEGIN
    -- Extract metadata
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', user_full_name || '''s Organization');

    -- Create organization for the user
    INSERT INTO organizations (name, description)
    VALUES (
        org_name,
        'Created automatically for ' || user_full_name
    )
    RETURNING id INTO new_org_id;

    -- Create user profile with organization
    INSERT INTO profiles (id, email, full_name, organization_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        new_org_id,
        'owner'
    );

    -- Log the organization creation
    INSERT INTO activity_logs (organization_id, user_id, action, resource_type, resource_id, details)
    VALUES (
        new_org_id,
        NEW.id,
        'create',
        'organization',
        new_org_id,
        jsonb_build_object('name', org_name, 'signup', true)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the initialize_user_organization function to handle existing profiles
CREATE OR REPLACE FUNCTION initialize_user_organization(
    org_name text DEFAULT 'My Organization',
    user_full_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_org_id uuid;
    user_profile_exists boolean;
    user_has_org boolean;
BEGIN
    -- Check if user profile exists and if they already have an organization
    SELECT 
        EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()),
        EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id IS NOT NULL)
    INTO user_profile_exists, user_has_org;
    
    IF user_has_org THEN
        RAISE EXCEPTION 'User already has an organization';
    END IF;

    -- Create new organization
    INSERT INTO organizations (name, description)
    VALUES (org_name, 'Created for ' || COALESCE(user_full_name, auth.email()))
    RETURNING id INTO new_org_id;

    -- Update or create user profile with organization
    IF user_profile_exists THEN
        -- Update existing profile
        UPDATE profiles 
        SET 
            organization_id = new_org_id,
            role = 'owner',
            full_name = COALESCE(user_full_name, full_name)
        WHERE id = auth.uid();
    ELSE
        -- Create new profile (fallback)
        INSERT INTO profiles (id, email, full_name, organization_id, role)
        VALUES (
            auth.uid(),
            auth.email(),
            COALESCE(user_full_name, auth.email()),
            new_org_id,
            'owner'
        );
    END IF;

    -- Log the organization creation
    INSERT INTO activity_logs (organization_id, user_id, action, resource_type, resource_id, details)
    VALUES (
        new_org_id,
        auth.uid(),
        'create',
        'organization',
        new_org_id,
        jsonb_build_object('name', org_name, 'manual_setup', true)
    );

    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add functions to update organization and profile information
CREATE OR REPLACE FUNCTION update_organization_name(
    new_name text
)
RETURNS void AS $$
DECLARE
    org_id uuid;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO org_id
    FROM profiles 
    WHERE id = auth.uid();

    IF org_id IS NULL THEN
        RAISE EXCEPTION 'User has no organization';
    END IF;

    -- Check if user has permission (owner or admin)
    IF NOT is_user_admin(auth.uid()) THEN
        RAISE EXCEPTION 'User does not have permission to update organization';
    END IF;

    -- Update organization name
    UPDATE organizations 
    SET name = new_name, updated_at = now()
    WHERE id = org_id;

    -- Log the update
    INSERT INTO activity_logs (organization_id, user_id, action, resource_type, resource_id, details)
    VALUES (
        org_id,
        auth.uid(),
        'update',
        'organization',
        org_id,
        jsonb_build_object('field', 'name', 'new_value', new_name)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_profile(
    new_full_name text
)
RETURNS void AS $$
BEGIN
    -- Update user's profile
    UPDATE profiles 
    SET full_name = new_full_name, updated_at = now()
    WHERE id = auth.uid();

    -- Log the update
    INSERT INTO activity_logs (
        organization_id, 
        user_id, 
        action, 
        resource_type, 
        resource_id, 
        details
    )
    VALUES (
        get_user_organization_id(auth.uid()),
        auth.uid(),
        'update',
        'profile',
        auth.uid(),
        jsonb_build_object('field', 'full_name', 'new_value', new_full_name)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION update_organization_name(text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(text) TO authenticated;