# Supabase Database Setup

This directory contains the database schema and migrations for the SaaS Vendor Management application.

## Migration Files

1. **001_initial_schema.sql** - Core database schema with all tables, indexes, and relationships
2. **002_rls_policies.sql** - Row Level Security policies for multi-tenant access control
3. **003_seed_data.sql** - Sample data for development and testing

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended for first setup)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **SQL Editor**
3. Run each migration file in order:
   - Copy and paste the contents of `001_initial_schema.sql`
   - Click "Run" to execute
   - Repeat for `002_rls_policies.sql` and `003_seed_data.sql`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
supabase db push
```

### Option 3: Manual Execution

1. Connect to your PostgreSQL database using your preferred client
2. Execute each SQL file in order

## Database Schema Overview

### Core Tables

- **organizations** - Multi-tenant organization support
- **profiles** - User profiles extending Supabase auth.users
- **categories** - Vendor categorization
- **vendors** - SaaS vendor information
- **subscriptions** - Subscription details and costs
- **documents** - Contract and document metadata
- **renewals** - Renewal history tracking
- **activity_logs** - Audit trail for all actions

### Key Features

- **Multi-tenant Architecture** - Full organization isolation with RLS
- **Automatic Profile Creation** - Triggers create user profiles on signup
- **Comprehensive Indexing** - Optimized for common query patterns
- **Audit Trail** - Complete activity logging
- **Helper Functions** - Utility functions for common operations
- **Sample Data** - Ready-to-use demo data for testing

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Organization-based isolation** - Users can only access their organization's data
- **Role-based permissions** - Owner/Admin/Member/Viewer roles
- **Secure functions** - Helper functions with SECURITY DEFINER

## After Migration

1. **Sign up your first user** through your app
2. **Run the organization initialization**:
   ```sql
   SELECT initialize_user_organization('Your Company Name', 'Your Full Name');
   ```
3. **Update the demo data** to use your real user ID and organization ID
4. **Test the RLS policies** by creating test data

## Useful Queries

### Get organization spending summary
```sql
SELECT * FROM get_organization_spending('your-org-id');
```

### View vendor summary with subscription counts
```sql
SELECT * FROM vendor_summary WHERE organization_id = 'your-org-id';
```

### Check upcoming renewals
```sql
SELECT * FROM upcoming_renewals WHERE organization_id = 'your-org-id';
```

### View activity log
```sql
SELECT * FROM activity_logs 
WHERE organization_id = 'your-org-id' 
ORDER BY created_at DESC 
LIMIT 50;
```

## Next Steps

After applying these migrations:

1. Set up Supabase Storage for document uploads
2. Configure email settings for authentication
3. Test the RLS policies with your application
4. Replace mock data in your frontend with real Supabase queries
5. Set up real-time subscriptions for live updates