# AVNERA Multi-Database Architecture

This e-commerce application uses a **three-database architecture** with Supabase to separate concerns and optimize performance. Each database handles specific aspects of the application:

## 🏗️ Database Architecture Overview

### 1. **User Database** 🔐
**Purpose**: Authentication, user profiles, and user-specific data

**Tables**:
- `user_profiles` - Extended user information beyond auth
- `user_addresses` - Shipping and billing addresses
- `user_preferences` - User shopping preferences and settings
- `user_sessions` - Session tracking and login history
- `user_activity_logs` - User activity tracking

**Connection**: Uses the primary Supabase project for authentication

### 2. **Orders Database** 📦
**Purpose**: Orders, payments, delivery, and transaction management

**Tables**:
- `orders` - Main order information
- `order_items` - Individual items within orders
- `payments` - Payment transactions and gateway data
- `payment_attempts` - Payment retry tracking
- `refunds` - Refund processing
- `shipments` - Shipping and tracking information
- `shipping_events` - Detailed shipping event tracking
- `coupons` - Discount coupons and promotions
- `coupon_usage` - Coupon usage tracking
- `returns` - Return and exchange requests
- `support_tickets` - Customer service tickets

### 3. **Products Database** 🛍️
**Purpose**: Product catalog, inventory, reviews, and shopping cart

**Tables**:
- `products` - Main product information
- `categories` - Product categories hierarchy
- `collections` - Product collections/groups
- `product_variants` - Product size/color variations
- `product_images` - Product images and media
- `product_attributes` - Flexible product attributes
- `product_attribute_values` - Product attribute assignments
- `inventory_movements` - Real-time inventory tracking
- `product_reviews` - Customer reviews and ratings
- `review_votes` - Review helpfulness voting
- `wishlists` - Customer wishlists
- `shopping_cart` - Shopping cart management
- `product_search` - Full-text search vectors

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# User Database (Authentication & Profiles)
NEXT_PUBLIC_SUPABASE_USER_URL=https://your-user-project.supabase.co
NEXT_PUBLIC_SUPABASE_USER_ANON_KEY=your-user-anon-key
SUPABASE_USER_SERVICE_ROLE_KEY=your-user-service-key

# Orders Database (Orders & Payments)
NEXT_PUBLIC_SUPABASE_ORDERS_URL=https://your-orders-project.supabase.co
NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY=your-orders-anon-key
SUPABASE_ORDERS_SERVICE_ROLE_KEY=your-orders-service-key

# Products Database (Catalog & Inventory)
NEXT_PUBLIC_SUPABASE_PRODUCTS_URL=https://your-products-project.supabase.co
NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY=your-products-anon-key
SUPABASE_PRODUCTS_SERVICE_ROLE_KEY=your-products-service-key
```

## 🚀 Setup Instructions

### 1. Create Three Supabase Projects

1. **User Database Project**
   - Create a new Supabase project
   - Run `database/user-db/schema.sql`
   - Enable Row Level Security
   - Configure authentication providers

2. **Orders Database Project**
   - Create a new Supabase project
   - Run `database/orders-db/schema.sql`
   - Set up payment webhook endpoints

3. **Products Database Project**
   - Create a new Supabase project
   - Run `database/products-db/schema.sql`
   - Enable full-text search extensions

### 2. Configure Environment Variables
Update your `.env.local` file with the connection details from all three projects.

### 3. Set Up Row Level Security (RLS)

Each database has RLS policies configured to ensure data security:

- **User DB**: Users can only access their own data
- **Orders DB**: Users can only see their own orders
- **Products DB**: Public read access, authenticated write access

### 4. Configure Webhooks (Optional)

Set up webhooks for real-time synchronization:
- Order status updates → Inventory adjustments
- Payment confirmations → Order status changes

## 📊 Data Flow Examples

### Creating an Order
1. **User selects products** → Products DB (cart management)
2. **User places order** → Orders DB (create order + items)
3. **Inventory updated** → Products DB (reduce quantities)
4. **Payment processed** → Orders DB (payment records)
5. **User notification** → User DB (activity logs)

### User Registration
1. **Auth signup** → User DB (Supabase Auth)
2. **Profile creation** → User DB (user_profiles)
3. **Welcome email** → User DB (preferences)

### Product Purchase Impact
1. **Sale recorded** → Orders DB (order_items)
2. **Inventory reduced** → Products DB (inventory_movements)
3. **Analytics updated** → All DBs (reporting queries)

## 🔗 Service Layer Architecture

### Data Services
- `UserService` - Handles user profiles, addresses, preferences
- `OrdersService` - Manages orders, payments, shipping
- `ProductsService` - Product catalog, inventory, reviews

### Client Management
- `getUserClient()` - User database operations
- `getOrdersClient()` - Order management operations  
- `getProductsClient()` - Product catalog operations
- Server variants available for API routes

## 🛡️ Security Considerations

### Row Level Security (RLS)
All databases implement RLS to ensure data isolation:

```sql
-- Example: Users can only see their own orders
CREATE POLICY "Users see own orders" ON orders 
FOR SELECT USING (auth.uid() = user_id);
```

### Service Role Keys
- Used for server-side operations requiring elevated permissions
- Never exposed to client-side code
- Required for admin operations and webhooks

### Cross-Database References
- User IDs are shared across all databases
- Product/Order IDs link Orders and Products databases
- Foreign key constraints within each database only

## 📈 Performance Optimizations

### Database Separation Benefits
1. **Reduced Query Complexity** - Smaller, focused datasets
2. **Independent Scaling** - Scale databases based on usage
3. **Improved Cache Efficiency** - Database-specific caching
4. **Better Resource Management** - Isolated resource usage

### Indexing Strategy
- **User DB**: Indexed on user_id for all tables
- **Orders DB**: Composite indexes on user_id + dates
- **Products DB**: Full-text search indexes + category filters

### Connection Pooling
Each database maintains its own connection pool for optimal resource utilization.

## 🔄 Data Synchronization

### Real-time Updates
- Supabase real-time subscriptions per database
- Cross-database updates via API routes
- Event-driven architecture for consistency

### Backup Strategy
- Each database backed up independently
- Point-in-time recovery available
- Cross-database restore coordination

## 🐛 Troubleshooting

### Common Issues

1. **Connection Errors**
   ```bash
   # Check environment variables
   echo $NEXT_PUBLIC_SUPABASE_USER_URL
   ```

2. **RLS Policy Issues**
   ```sql
   -- Temporarily disable RLS for debugging
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

3. **Cross-Database Reference Issues**
   - Ensure user IDs exist in User DB before creating orders
   - Validate product IDs exist before adding to cart

### Monitoring
- Set up monitoring for each database separately
- Track query performance across databases
- Monitor connection pool usage

## 🚀 Deployment

### Production Checklist
- [ ] All three databases created and configured
- [ ] Environment variables set in production
- [ ] RLS policies enabled and tested
- [ ] Service role keys secured
- [ ] Backup strategies configured
- [ ] Monitoring and alerting set up

### Migration Strategy
1. Deploy databases in order: User → Products → Orders
2. Test each database connection independently
3. Run end-to-end tests across all databases
4. Monitor performance and adjust as needed

---

## 📞 Support

For setup assistance or questions about the multi-database architecture, please refer to the individual schema files:

- `database/user-db/schema.sql` - User database schema
- `database/orders-db/schema.sql` - Orders database schema  
- `database/products-db/schema.sql` - Products database schema

Each schema file contains detailed table structures, relationships, and sample data for testing.
