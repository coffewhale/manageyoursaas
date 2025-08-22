# SaaS Vendor Management App

A modern web application for managing SaaS vendors, subscriptions, and costs.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, authentication, real-time, file storage)
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Core Features

### Vendor Management
- Add/edit/delete SaaS vendors
- Track vendor details (name, website, contact info, category)
- Upload vendor contracts and documents
- Vendor status tracking (active, inactive, trial)

### Subscription Tracking
- Multiple subscriptions per vendor
- Subscription details (plan name, cost, billing cycle, renewal date)
- User seat management
- Cost tracking and budgeting
- Renewal reminders and alerts

### User Management
- Multi-user support with Supabase Row Level Security (RLS)
- Team collaboration with real-time features
- Role-based access control
- Approval workflows for new subscriptions

### Dashboard & Analytics
- Total SaaS spend overview
- Upcoming renewals
- Cost breakdown by vendor/category
- Usage analytics and ROI tracking
- Export reports (CSV, PDF)

## Database Schema (Supabase)

### Core Tables
- `vendors` - SaaS vendor information
- `subscriptions` - Subscription details and costs  
- `profiles` - User profiles (extends Supabase auth.users)
- `categories` - Vendor categorization
- `renewals` - Renewal tracking and history
- `documents` - Contract metadata (files stored in Supabase Storage)
- `organizations` - Multi-tenant organization support

### Supabase Features to Leverage
- **Row Level Security (RLS)** - Secure multi-tenant data access
- **Real-time subscriptions** - Live updates across the app
- **Supabase Storage** - File uploads for contracts and documents
- **Supabase Auth** - User authentication with email/password, OAuth
- **Database functions** - Custom PostgreSQL functions for complex queries

## Initial Setup Requirements

1. Set up Next.js 14 with TypeScript
2. Configure Tailwind CSS and shadcn/ui
3. Set up Supabase project and configure database schema
4. Implement Supabase Auth for authentication
5. Set up Supabase Storage for file uploads
6. Create basic CRUD operations for vendors and subscriptions
7. Build responsive dashboard with charts
8. Implement real-time subscriptions for collaborative features
9. Set up Row Level Security (RLS) policies

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Key Components to Build

- Vendor list and detail pages
- Subscription management interface
- Dashboard with spending analytics
- Renewal calendar and notifications
- User settings and team management
- File upload and document viewer
- Search and filtering capabilities

## Nice-to-Have Features

- Integration with accounting software (QuickBooks, Xero)
- Email notifications for renewals (using Supabase Edge Functions)
- Mobile-responsive design
- Dark mode support
- API for third-party integrations
- Automated vendor discovery via email parsing
- Real-time activity feed
- Advanced analytics with custom PostgreSQL views