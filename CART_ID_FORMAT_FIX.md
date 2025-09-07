# Cart Product ID Format Fix

## Problem
The cart API was receiving "Invalid product_id format" errors because:

1. **Frontend sample products** used simple string IDs like `'1'`, `'2'`, etc.
2. **Cart API validation** expected UUID format (e.g., `123e4567-e89b-12d3-a456-426614174000`)
3. **Database products** actually use UUID format when created via Supabase

## Root Cause
- Products page (`/src/app/(frontend)/products/page.tsx`) contained hardcoded sample products with non-UUID IDs
- ProductCard component (`/src/components/ui/ProductCard.tsx`) sent these IDs directly to cart API
- Cart API (`/src/app/api/cart/route.ts`) validated product IDs with strict UUID regex on lines 117-129

## Fix Applied
Updated all sample product and category IDs to use valid UUID format:

### Before:
```js
const sampleProducts = [
  {
    id: '1',  // Simple string ID
    name: 'Elegant Silk Saree',
    // ...
  }
]
```

### After:
```js
const sampleProducts = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',  // Valid UUID format
    name: 'Elegant Silk Saree',
    // ...
  }
]
```

## Test Results
- ✅ Cart API now accepts the UUID formatted product IDs
- ✅ No more "Invalid product_id format" errors
- ✅ Cart validation passes (401 errors are expected without authentication)

## Long-term Recommendation
Replace hardcoded sample products with actual database products by:

1. Fetching products from `/api/products` endpoint
2. Using the `ProductsService.getProducts()` method
3. Removing dependency on hardcoded sample data

## Files Modified
- `/src/app/(frontend)/products/page.tsx` - Updated all sample product and category IDs to UUID format

## Commands to Test
```powershell
# Test with valid UUID (should pass validation but require authentication)
Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method POST -Body '{"product_id":"123e4567-e89b-12d3-a456-426614174001","quantity":1}' -ContentType "application/json"

# Expected: 401 Unauthorized (which means UUID validation passed)
```

## Next Steps
1. ✅ Fixed immediate UUID validation issue
2. 🔄 Consider implementing proper product fetching from database
3. 🔄 Test full cart functionality with authenticated user
