-- Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'trial')) DEFAULT 'active',
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cost NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')) NOT NULL,
  currency TEXT DEFAULT 'USD',
  start_date DATE NOT NULL,
  next_renewal_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  user_seats INTEGER,
  contract_url TEXT,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create renewals table
CREATE TABLE renewals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  previous_cost NUMERIC(10,2) NOT NULL,
  new_cost NUMERIC(10,2) NOT NULL,
  previous_renewal_date DATE NOT NULL,
  new_renewal_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_vendors_organization_id ON vendors(organization_id);
CREATE INDEX idx_vendors_category_id ON vendors(category_id);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_vendor_id ON subscriptions(vendor_id);
CREATE INDEX idx_subscriptions_next_renewal_date ON subscriptions(next_renewal_date);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_vendor_id ON documents(vendor_id);
CREATE INDEX idx_documents_subscription_id ON documents(subscription_id);
CREATE INDEX idx_renewals_subscription_id ON renewals(subscription_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
  ('CRM', 'Customer Relationship Management', '#3B82F6'),
  ('Marketing', 'Marketing and Advertising Tools', '#10B981'),
  ('Development', 'Development and Productivity Tools', '#8B5CF6'),
  ('Analytics', 'Analytics and Business Intelligence', '#F59E0B'),
  ('Communication', 'Communication and Collaboration', '#EF4444'),
  ('Security', 'Security and Compliance Tools', '#6B7280'),
  ('HR', 'Human Resources and Payroll', '#EC4899'),
  ('Finance', 'Finance and Accounting', '#14B8A6');

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Profiles: Users can see profiles in their organization
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Categories: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Vendors: Organization-scoped access
CREATE POLICY "Users can view vendors in their organization" ON vendors
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert vendors in their organization" ON vendors
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update vendors in their organization" ON vendors
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete vendors in their organization" ON vendors
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Subscriptions: Organization-scoped access
CREATE POLICY "Users can view subscriptions in their organization" ON subscriptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert subscriptions in their organization" ON subscriptions
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update subscriptions in their organization" ON subscriptions
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subscriptions in their organization" ON subscriptions
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Documents: Organization-scoped access
CREATE POLICY "Users can view documents in their organization" ON documents
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents in their organization" ON documents
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own documents or admins can delete any" ON documents
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Renewals: Accessible through subscription relationship
CREATE POLICY "Users can view renewals in their organization" ON renewals
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert renewals in their organization" ON renewals
  FOR INSERT WITH CHECK (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update renewals in their organization" ON renewals
  FOR UPDATE USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );