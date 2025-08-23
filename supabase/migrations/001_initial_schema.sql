-- SaaS Vendor Management Database Schema
-- This migration creates all the core tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE vendor_status AS ENUM ('active', 'inactive', 'trial');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial', 'cancelled', 'expired');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE document_type AS ENUM ('contract', 'amendment', 'invoice', 'other');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Organizations table (multi-tenant support)
CREATE TABLE organizations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    role user_role DEFAULT 'member' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Categories table for vendor classification
CREATE TABLE categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#6366f1',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(organization_id, name)
);

-- Vendors table
CREATE TABLE vendors (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    website text,
    contact_email text,
    contact_phone text,
    description text,
    logo_url text,
    status vendor_status DEFAULT 'active' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    cost numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD' NOT NULL,
    billing_cycle billing_cycle NOT NULL,
    user_seats integer DEFAULT 1,
    start_date date NOT NULL,
    end_date date,
    next_renewal_date date,
    auto_renew boolean DEFAULT true,
    status subscription_status DEFAULT 'active' NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Documents table for contracts and files
CREATE TABLE documents (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
    subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    type document_type NOT NULL,
    uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Renewals table for tracking renewal history
CREATE TABLE renewals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
    previous_cost numeric(10,2),
    new_cost numeric(10,2) NOT NULL,
    renewal_date date NOT NULL,
    next_renewal_date date,
    notes text,
    processed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Activity log table for audit trail
CREATE TABLE activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    details jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_categories_organization_id ON categories(organization_id);
CREATE INDEX idx_vendors_organization_id ON vendors(organization_id);
CREATE INDEX idx_vendors_category_id ON vendors(category_id);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_vendor_id ON subscriptions(vendor_id);
CREATE INDEX idx_subscriptions_next_renewal_date ON subscriptions(next_renewal_date);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_vendor_id ON documents(vendor_id);
CREATE INDEX idx_documents_subscription_id ON documents(subscription_id);
CREATE INDEX idx_renewals_organization_id ON renewals(organization_id);
CREATE INDEX idx_renewals_subscription_id ON renewals(subscription_id);
CREATE INDEX idx_renewals_renewal_date ON renewals(renewal_date);
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Functions for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (id, organization_id, name, description, color) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 'Communication', 'Team communication and collaboration tools', '#3B82F6'),
    ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000000', 'Development', 'Software development and coding tools', '#10B981'),
    ('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000000', 'Design', 'Design and creative software', '#F59E0B'),
    ('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000000', 'Analytics', 'Data analytics and business intelligence', '#EF4444'),
    ('550e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000000', 'Marketing', 'Marketing and advertising platforms', '#8B5CF6'),
    ('550e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000000', 'Productivity', 'Productivity and project management', '#06B6D4'),
    ('550e8400-e29b-41d4-a716-446655440007', '00000000-0000-0000-0000-000000000000', 'Security', 'Security and compliance tools', '#F97316'),
    ('550e8400-e29b-41d4-a716-446655440008', '00000000-0000-0000-0000-000000000000', 'Other', 'Other software and services', '#6B7280');

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();