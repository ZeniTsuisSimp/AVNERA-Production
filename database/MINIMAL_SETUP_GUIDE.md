# 🚀 Minimal Database Setup Guide

**Simplified schemas with only essential columns for a functional e-commerce app.**

## ✅ Current Status
- ✅ Orders Database: Already configured and working
- 🔄 Products Database: Ready for minimal schema
- ❓ User Database: Needs new project + minimal schema

## 📊 What You'll Get (Minimal Tables)

### 👤 User Database (2 tables)
- `user_profiles` - Basic user info (id, email, name, phone)
- `user_addresses` - Shipping addresses

### 🛒 Orders Database (3 tables) 
- `orders` - Order info (id, user, amount, status, address)
- `order_items` - Products in each order  
- `payments` - Payment transactions

### 🛍️ Products Database (5 tables)
- `products` - Product catalog (name, price, description, stock)
- `categories` - Product categories
- `shopping_cart` - Cart items
- `wishlists` - User wishlists
- `product_reviews` - Customer reviews

## 🎯 Setup Steps (3 minutes)

### 1. Apply Products Database Schema (Now)
Your Products DB is ready! Just apply the minimal schema:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open project: `https://yqxhuckbvhqswkmathda.supabase.co`  
3. Go to **SQL Editor** → **New Query**
4. Copy content from `database/products-db/schema-minimal.sql`
5. **Run** the query

### 2. Update Orders Database (Optional)
Your current Orders DB has full tables. If you want to simplify:

1. Open project: `https://kgnumfhgkivdegkigrfe.supabase.co`
2. Use `database/orders-db/schema-minimal.sql`

### 3. Set Up User Database (When Ready)
Create a new Supabase project and use `database/user-db/schema-minimal.sql`

## 🧪 Test Setup

```bash
npm run test:db-connections
```

## 📋 Removed Features (Simplified)

### From User DB:
- User preferences, sessions, activity logs
- Extra profile fields (avatar, notifications, etc.)
- Complex address fields

### From Orders DB:  
- Shipments, coupons, returns, support tickets
- Billing address (kept shipping only)
- Complex order metadata

### From Products DB:
- Product variants, attributes, collections  
- Product images table (now single `image_url`)
- Inventory movements, search features

## 🚀 Benefits of Minimal Schema

- ✅ **Faster Setup**: 3 minutes vs 30 minutes
- ✅ **Simpler Code**: Less complexity
- ✅ **Better Performance**: Fewer joins
- ✅ **Easy to Extend**: Add features later as needed

## 🔧 Essential Features Kept

- ✅ **User Management**: Profiles, addresses
- ✅ **Order Processing**: Full order workflow
- ✅ **Product Catalog**: Categories, pricing, stock
- ✅ **Shopping Cart**: Add/remove items
- ✅ **Reviews**: Customer feedback
- ✅ **Security**: RLS policies with Clerk
- ✅ **Auto-features**: Order numbers, timestamps

## 📈 Easy to Extend Later

Need more features? Just add columns/tables:
- Product variants → Add `product_variants` table
- User preferences → Add `user_preferences` table  
- Order tracking → Add `shipments` table
- etc.

---

**Time to setup: ~3 minutes**  
**Perfect for: MVP, prototype, or simple e-commerce**
