# Database Migration Instructions

## Problem
Your application is trying to create orders with financial columns (subtotal, tax_amount, shipping_amount, discount_amount) that don't exist in your current orders table.

## Solution
You need to add these columns to your existing Supabase orders database.

## Steps to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your orders project: `kgnumfhgkivdegkigrfe`
3. Navigate to the SQL Editor
4. Copy and paste the contents of `add_financial_columns_migration.sql`
5. Execute the SQL script

### Option 2: Using Supabase CLI
If you have Supabase CLI installed:
```bash
supabase db push --db-url postgresql://postgres:[password]@db.kgnumfhgkivdegkigrfe.supabase.co:5432/postgres
```

### Option 3: Using psql (Advanced)
If you have direct database access:
```bash
psql postgresql://postgres:[password]@db.kgnumfhgkivdegkigrfe.supabase.co:5432/postgres -f add_financial_columns_migration.sql
```

## Migration Contents
The migration adds the following columns to the `orders` table:
- `subtotal` (DECIMAL(12,2), NOT NULL, DEFAULT 0.00)
- `tax_amount` (DECIMAL(12,2), NOT NULL, DEFAULT 0.00) 
- `shipping_amount` (DECIMAL(12,2), NOT NULL, DEFAULT 0.00)
- `discount_amount` (DECIMAL(12,2), NOT NULL, DEFAULT 0.00)

## After Migration
Once you've run the migration successfully:
1. Your application should be able to create orders without errors
2. The checkout process will work properly
3. All financial calculations will be stored correctly

## Verification
To verify the migration worked, you can run this query in Supabase SQL Editor:
```sql
\d public.orders;
```

You should see the new columns listed in the table structure.
