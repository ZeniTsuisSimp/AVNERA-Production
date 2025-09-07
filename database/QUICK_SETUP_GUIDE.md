# 🚀 Quick Database Setup Guide

Your environment is **already configured correctly**! All three database connections are working. You just need to apply the schemas.

## ✅ Current Status
- ✅ User Database: Connected
- ✅ Orders Database: Connected  
- ✅ Products Database: Connected
- ❌ Schemas: Not applied yet

## 🎯 Next Steps (5 minutes)

### 1. Apply User Database Schema
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open your **User Database project** (the one with URL: `https://yqxhuckbvhqswkmathda.supabase.co`)
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire content of `database/user-db/schema.sql`
6. Paste it in the SQL editor
7. Click **Run** (or press Ctrl+Enter)

### 2. Apply Orders Database Schema
1. Open your **Orders Database project** 
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire content of `database/orders-db/schema.sql`
5. Paste it in the SQL editor
6. Click **Run**

### 3. Apply Products Database Schema
1. Open your **Products Database project**
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire content of `database/products-db/schema.sql`
5. Paste it in the SQL editor
6. Click **Run**

## 🧪 Test Your Setup

After applying all schemas, run:

```bash
npm run test:db-connections
```

You should see all tables found and a success message! 🎉

## 📊 What Gets Created

### User Database (5 tables)
- `user_profiles` - User account information
- `user_addresses` - Shipping/billing addresses  
- `user_preferences` - User settings and preferences
- `user_sessions` - Login session tracking
- `user_activity_logs` - Activity history

### Orders Database (7 main tables)
- `orders` - Order information
- `order_items` - Products in each order
- `payments` - Payment transactions
- `shipments` - Shipping information
- `coupons` - Discount codes
- `returns` - Return/exchange requests
- `support_tickets` - Customer support

### Products Database (8 main tables)
- `products` - Product catalog
- `categories` - Product categories
- `collections` - Product collections
- `product_variants` - Size/color variants
- `product_images` - Product photos
- `wishlists` - User wishlists
- `shopping_cart` - Shopping cart items
- `product_reviews` - Customer reviews

## 🔧 Features Included

### 🔐 Security
- Row Level Security (RLS) enabled
- Clerk authentication integration
- Secure cross-database references

### ⚡ Performance
- Optimized indexes on all tables
- Full-text search for products
- Automatic timestamp updates

### 🤖 Automation
- Auto-generated order numbers
- Automatic inventory tracking
- Review statistics calculation
- Search vector updates

## 🆘 Need Help?

If you encounter any issues:

1. **Check SQL Error Messages**: Look for specific table/column names in error messages
2. **Run Queries Individually**: If a schema fails, try running sections separately
3. **Check Extensions**: Ensure UUID and other extensions are enabled
4. **Verify Permissions**: Make sure you have admin access to the projects

## 📞 Support Resources

- 📚 Full Documentation: `database/SETUP_INSTRUCTIONS.md`
- 🧪 Test Script: `npm run test:db-connections`
- 🔗 Supabase Docs: https://supabase.com/docs
- 💬 Get Help: https://supabase.com/discord

---

**Estimated time: 5-10 minutes**  
**Difficulty: Easy** 📝
