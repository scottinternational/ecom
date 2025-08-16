# Database Setup Guide

## Overview
This guide will help you set up the complete database for the Product Voyage Control application.

## Prerequisites
- A Supabase project with the following credentials:
  - Project ID: `idmbhgegrfohkdfeekgk`
  - Project URL: `https://idmbhgegrfohkdfeekgk.supabase.co`
  - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWJoZ2VncmZvaGtkZmVla2drIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMyNjY1MCwiZXhwIjoyMDcwOTAyNjUwfQ.4_n0Q-2EEeuDBM7l2b6UI5Ua7hqINaZ4LBt_Yk6BNK0`

## Database Schema

The application includes the following tables:

### Core Tables
1. **profiles** - User profile information
2. **user_roles** - User role assignments (admin, manager, staff, viewer)
3. **categories** - Product categories with hierarchical support
4. **suppliers** - Supplier information
5. **products** - Product catalog with specifications
6. **inventory** - Stock management
7. **orders** - Customer orders
8. **order_items** - Individual items in orders
9. **production_batches** - Production planning and tracking
10. **marketing_campaigns** - Marketing campaign management
11. **product_reviews** - Customer reviews with approval workflow

### Enums
- `app_role`: admin, manager, staff, viewer
- `order_status`: pending, processing, shipped, delivered, cancelled
- `product_status`: draft, active, discontinued, out_of_stock
- `campaign_status`: draft, active, paused, completed
- `production_status`: planned, in_progress, completed, cancelled

## Setup Instructions

### Step 1: Run the Database Setup Script

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `database_setup.sql` and paste it into the SQL Editor
4. Click "Run" to execute the script

This will create:
- All enum types
- All tables with proper relationships
- Row Level Security (RLS) policies
- Functions for role management
- Triggers for automatic user creation and timestamp updates
- Sample data for categories and suppliers

### Step 2: Set Up Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your authentication providers (Email, Google, etc.)
3. Set up any additional authentication settings as needed

### Step 3: Create Your First Admin User

1. Sign up for an account through your application
2. Go to the SQL Editor in your Supabase dashboard
3. Edit the `promote_admin.sql` file and replace `'your-email@example.com'` with your actual email
4. Run the script to promote yourself to admin role

### Step 4: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if enums were created
SELECT typname FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e';

-- Check your user role
SELECT p.email, ur.role 
FROM public.profiles p 
JOIN public.user_roles ur ON p.id = ur.user_id 
WHERE p.email = 'your-email@example.com';
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Viewers**: Can view most data but cannot modify
- **Staff**: Can manage orders and order items
- **Managers**: Can manage products, inventory, categories, suppliers, production, and marketing
- **Admins**: Full access to all data and user management

### Role-Based Access Control
- Users are automatically assigned 'viewer' role on signup
- Admins can promote users to higher roles
- Role-based permissions are enforced at the database level

## Sample Data

The setup script includes sample data:
- 4 product categories (Electronics, Clothing, Home & Garden, Sports & Outdoors)
- 3 sample suppliers

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**: Make sure you're signed in and have the appropriate role
2. **Foreign Key Violations**: Ensure referenced records exist before creating dependent records
3. **RLS Policy Issues**: Check that your user has the correct role assigned

### Useful Queries

```sql
-- Check all users and their roles
SELECT p.email, p.full_name, ur.role, p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at DESC;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Next Steps

After setting up the database:

1. Start your development server: `npm run dev`
2. Sign up for an account
3. Promote yourself to admin using the `promote_admin.sql` script
4. Begin using the application!

## Support

If you encounter any issues during setup, check:
1. Supabase project logs
2. Application console for any errors
3. Database connection settings in your application
