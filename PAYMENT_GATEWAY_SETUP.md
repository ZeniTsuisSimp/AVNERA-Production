# 🚀 Payment Gateway Setup Instructions

Your Avnera e-commerce project is **almost ready** but needs these critical configurations to make the payment gateway work.

## ✅ What's Already Working
- ✅ All dependencies installed (Razorpay, Stripe, Zod)
- ✅ Payment utility functions created
- ✅ Basic project structure in place

## ❌ What Needs to Be Fixed

### 1. **Configure Environment Variables**

Replace the placeholder values in your `.env.local` file:

```env
# Test Keys - Replace with your actual keys from dashboards
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Get Your Keys:**
- **Razorpay**: [Dashboard](https://dashboard.razorpay.com/app/website-app-settings/api-keys)
- **Stripe**: [Dashboard](https://dashboard.stripe.com/apikeys)

### 2. **Update Database Schema**

Your current Prisma schema is missing payment-related tables. Run this migration:

```bash
# Apply the payment tables migration
npx prisma db execute --file ./prisma/migrations/add_payment_tables.sql

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

### 3. **Add Missing API Routes**

I've created the payment intent API, but you need more routes. Create these files:

#### Cart API Routes:
```bash
mkdir -p src/app/api/cart
mkdir -p src/app/api/orders
mkdir -p src/app/api/user/profile
mkdir -p src/app/api/user/addresses
mkdir -p src/app/api/payments/razorpay
mkdir -p src/app/api/payments/stripe
mkdir -p src/app/api/webhooks
```

Let me know if you want me to create all the remaining API routes.

## 🧪 **Quick Test**

Once configured, test with these commands:

```bash
# 1. Start the development server
npm run dev

# 2. Test payment intent creation (replace with real values)
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "RAZORPAY",
    "cartData": {
      "items": [{"productId": "test", "quantity": 1, "price": 100}],
      "total": 100
    },
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "addressLine1": "123 Test St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "IN"
    }
  }'
```

## 🔄 **Current Status**

**Will it work if you start it now?** 

❌ **NO** - You need to:
1. ✅ Configure real payment gateway keys
2. ✅ Run database migrations  
3. ✅ Create remaining API routes
4. ✅ Set up webhooks in payment dashboards

**Time needed:** 15-30 minutes

## 🚀 **Next Steps**

1. **Get API Keys**: Sign up for test accounts and get keys
2. **Run Migration**: Execute the SQL migration I created
3. **Test Payment**: Try creating a payment intent
4. **Add Frontend**: Create payment buttons and forms

Would you like me to:
- Create all the remaining API routes?
- Set up the frontend payment components?
- Create sample product data?

Let me know what you'd like to tackle first!

## 🆘 **Need Help?**

If you encounter errors, check:
1. Database connection in `.env`
2. Payment gateway credentials
3. Prisma client generation
4. Console errors in browser/terminal

**Common Error:** `Razorpay API keys are not configured` means environment variables aren't loaded properly.
