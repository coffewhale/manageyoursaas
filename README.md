# SaaS Vendor Management App

A modern web application for managing SaaS vendors, subscriptions, and costs built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🏢 Vendor Management
- Add, edit, and delete SaaS vendors
- Track vendor details (name, website, contact info, category)
- Upload vendor contracts and documents
- Vendor status tracking (active, inactive, trial)
- Categorize vendors for better organization

### 💳 Subscription Tracking
- Multiple subscriptions per vendor
- Subscription details (plan name, cost, billing cycle, renewal date)
- User seat management
- Cost tracking and budgeting
- Renewal reminders and alerts
- Auto-renewal settings

### 👥 User Management
- Multi-user support with Supabase Row Level Security (RLS)
- Team collaboration with real-time features
- Role-based access control (admin, manager, member)
- User invitation and management

### 📊 Dashboard & Analytics
- Total SaaS spend overview
- Upcoming renewals dashboard
- Cost breakdown by vendor/category
- Usage analytics and insights
- Real-time activity feed

### 📄 Document Management
- Upload and manage contracts, invoices, and other documents
- File association with vendors and subscriptions
- Document categorization and search
- Secure file storage with Supabase Storage

### 🔔 Real-time Features
- Live activity feed
- Real-time notifications
- Collaborative editing
- Instant updates across team members

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, authentication, real-time, file storage)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage
- **Real-time**: Supabase real-time subscriptions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saas_vendor_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Go to Project Settings > API to get your URL and keys
   - Copy the SQL schema from `supabase_schema.sql` and run it in your Supabase SQL editor

4. **Configure environment variables**
   - Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. **Create Supabase Project**
   - Sign up at https://supabase.com
   - Create a new project
   - Wait for the project to be ready

2. **Run SQL Schema**
   - Copy the contents of `supabase_schema.sql`
   - Go to your Supabase project > SQL Editor
   - Paste and run the schema to create tables, policies, and sample data

3. **Set up Storage (Optional)**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `documents`
   - Configure bucket policies for authenticated users

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard and features
│   │   ├── vendors/       # Vendor management
│   │   ├── subscriptions/ # Subscription management
│   │   ├── documents/     # Document management
│   │   ├── team/          # Team management
│   │   └── settings/      # Settings
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── vendors/          # Vendor-specific components
│   ├── subscriptions/    # Subscription components
│   └── documents/        # Document components
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── hooks/                # Custom React hooks
│   └── use-realtime.ts   # Real-time data hook
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    └── database.ts       # Database types
```

## Environment Variables

Required environment variables for the application:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Run type checking
npx tsc --noEmit
```

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- **organizations**: Multi-tenant organization support
- **profiles**: User profiles (extends Supabase auth.users)
- **categories**: Vendor categorization
- **vendors**: SaaS vendor information
- **subscriptions**: Subscription details and costs
- **documents**: File metadata (files stored in Supabase Storage)
- **renewals**: Renewal tracking and history

All tables include Row Level Security (RLS) policies for secure multi-tenant access.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms

The app can be deployed to any platform that supports Next.js applications:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## License

This project is licensed under the MIT License.
# Deploy trigger
