-- Fix Security Definer View issues by adding RLS policies

-- Enable RLS on the views
ALTER VIEW vendor_summary SET (security_barrier = true);
ALTER VIEW upcoming_renewals SET (security_barrier = true);

-- Create RLS policies for vendor_summary view
CREATE POLICY "Users can view vendor summary in their organization" ON vendor_summary
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

-- Create RLS policies for upcoming_renewals view  
CREATE POLICY "Users can view upcoming renewals in their organization" ON upcoming_renewals
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

-- Enable RLS on the views
ALTER VIEW vendor_summary ENABLE ROW LEVEL SECURITY;
ALTER VIEW upcoming_renewals ENABLE ROW LEVEL SECURITY;