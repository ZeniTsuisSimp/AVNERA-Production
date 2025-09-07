# Multi-Database Setup Instructions

This document explains how to set up the three separate databases for the AVNERA e-commerce application.

## Database Architecture

The application uses three separate Supabase databases:

1. **User Database** - Authentication, user profiles, addresses, preferences
2. **Orders Database** - Orders, payments, shipments, support tickets
3. **Products Database** - Product catalog, inventory, reviews, wishlist

## Setup Process

### Step 1: Create Supabase Projects

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create three new projects:
   - `avnera-users` (or your preferred naming)
   - `avnera-orders` 
   - `avnera-products`

### Step 2: Apply Database Schemas

For each database, go to the SQL Editor in Supabase and run the corresponding schema file:

1. **User Database**: Run `database/user-db/schema.sql`
2. **Orders Database**: Run `database/orders-db/schema.sql`
3. **Products Database**: Run `database/products-db/schema.sql`

### Step 3: Configure Environment Variables

Update your `.env.local` file with the connection details for all three databases:

```env
# User Database (Already configured)
NEXT_PUBLIC_SUPABASE_USER_URL=https://yqxhuckbvhqswkmathda.supabase.co
NEXT_PUBLIC_SUPABASE_USER_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_USER_SERVICE_ROLE_KEY=your-user-db-service-role-key

# Orders Database (Update with your orders project details)
NEXT_PUBLIC_SUPABASE_ORDERS_URL=https://your-orders-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY=your-orders-supabase-anon-key
SUPABASE_ORDERS_SERVICE_ROLE_KEY=your-orders-db-service-role-key

# Products Database (Update with your products project details)
NEXT_PUBLIC_SUPABASE_PRODUCTS_URL=https://your-products-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY=your-products-supabase-anon-key
SUPABASE_PRODUCTS_SERVICE_ROLE_KEY=your-products-db-service-role-key
```

### Step 4: Test Database Connections

After setting up all databases, run the test script:

```bash
npm run test:db-connections
```

## Database Features

### User Database Features
- Clerk authentication integration
- User profiles with extended information
- Multiple address management
- User preferences and settings
- Session tracking and activity logs
- Row Level Security (RLS) with Clerk JWT

### Orders Database Features
- Complete order management workflow
- Multi-payment gateway support (Razorpay, Stripe)
- Shipping and tracking integration
- Coupon and discount system
- Returns and exchange management
- Support ticket system
- Automatic order number generation

### Products Database Features
- Hierarchical category system
- Product variants and attributes
- Inventory tracking with movement logs
- Product reviews and ratings
- Wishlist and shopping cart
- Full-text search capabilities
- Automated inventory updates

## Important Notes

1. **Authentication**: All databases use Clerk user IDs (string format) instead of Supabase Auth UUIDs
2. **Cross-database References**: User IDs are referenced as strings across all databases
3. **Row Level Security**: Each database has appropriate RLS policies for data security
4. **Triggers and Functions**: Automated processes for inventory, timestamps, and data consistency

## Next Steps

1. Create the three Supabase projects
2. Apply the SQL schemas to each database
3. Update environment variables with your project details
4. Test the connections
5. Start using the multi-database architecture in your application
