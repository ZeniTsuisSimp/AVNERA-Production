# Frontend and Backend Separation

## 🎯 **New Project Structure**

### **Frontend (Pages & Components)**
```
src/app/(frontend)/
├── page.tsx                    # Home page
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── account/                    # Account pages
│   ├── layout.tsx             # Account layout
│   ├── orders/                # Orders pages
│   ├── addresses/             # Addresses pages
│   └── profile/               # Profile pages
├── auth/                       # Authentication pages
├── cart/                       # Shopping cart pages
├── checkout/                   # Checkout pages
├── products/                   # Product pages
├── search/                     # Search pages
└── wishlist/                   # Wishlist pages
```

### **Backend (API & Logic)**
```
src/app/api/                    # API Routes (Next.js routing)
├── addresses/
│   └── route.ts               # Address CRUD operations
├── orders/
│   └── route.ts               # Order operations
├── cart/
├── payments/
├── products/
├── users/
└── webhooks/

src/backend/                    # Backend Business Logic
├── controllers/                # Request handlers
│   ├── ordersController.ts    # Order business logic
│   └── addressesController.ts # Address business logic
├── services/                   # Business services
│   └── databaseService.ts     # Database utilities
├── models/                     # Type definitions
│   ├── Order.ts              # Order types
│   └── Address.ts            # Address types
└── utils/                      # Utility functions
    ├── auth.ts               # Authentication utils
    └── response.ts           # Response utils
```

## 🔧 **How It Works**

### **Routing Structure**

#### **Frontend Routes (Pages)**
- `/(frontend)` - Route group (doesn't affect URL)
- All user-facing pages are in `src/app/(frontend)/`
- URLs work exactly the same:
  - `/` → Home page
  - `/account/orders` → Orders page
  - `/account/addresses` → Addresses page
  - `/cart` → Cart page
  - etc.

#### **Backend Routes (API)**
- `/api/*` - All API endpoints
- Stay in `src/app/api/` (required by Next.js)
- URLs:
  - `GET /api/orders` → Get orders
  - `POST /api/orders` → Create order
  - `GET /api/addresses` → Get addresses
  - etc.

### **Request Flow**

1. **Frontend Page** (`src/app/(frontend)/account/orders/page.tsx`)
   - User visits `/account/orders`
   - Page component renders
   - Makes API call to `/api/orders`

2. **API Route** (`src/app/api/orders/route.ts`)
   - Receives API request
   - Calls **Controller** method
   - Returns response

3. **Controller** (`src/backend/controllers/ordersController.ts`)
   - Contains business logic
   - Uses **Services** and **Models**
   - Returns structured data

4. **Services & Utils** (`src/backend/services/`, `src/backend/utils/`)
   - Database operations
   - Authentication
   - Response formatting

## 🎪 **Benefits of This Structure**

### **1. Clear Separation of Concerns**
- **Frontend**: UI, pages, user interactions
- **Backend**: Business logic, data processing, API handling

### **2. Better Code Organization**
- Related functionality grouped together
- Easier to find and maintain code
- Clear dependencies between layers

### **3. Reusable Backend Logic**
- Controllers can be used by multiple API routes
- Services can be shared across controllers
- Utils provide common functionality

### **4. Type Safety**
- Shared models ensure consistent data types
- Better IntelliSense and error checking
- Reduced runtime errors

### **5. Easier Testing**
- Controllers can be tested independently
- Services can be mocked
- Clear boundaries for unit tests

## 🚀 **Migration Benefits**

### **Before (Mixed Structure)**
```typescript
// API route with mixed concerns
export async function GET(request: NextRequest) {
  // Authentication logic
  const user = await currentUser();
  if (!user) return unauthorized();
  
  // Database logic
  const { data, error } = await supabase...;
  
  // Business logic
  // ... lots of code in one file
  
  // Response handling
  return NextResponse.json({...});
}
```

### **After (Separated Structure)**
```typescript
// Clean API route
export async function GET(request: NextRequest) {
  const result = await OrdersController.getUserOrders(request);
  return handleResponse(result);
}

// Business logic in controller
class OrdersController {
  static async getUserOrders(request) {
    // Clean, focused business logic
    // Reusable across different API routes
  }
}
```

## 📁 **File Responsibilities**

### **API Routes** (`src/app/api/*/route.ts`)
- **Purpose**: HTTP request/response handling
- **Responsibilities**:
  - Parse request parameters
  - Call appropriate controller method
  - Format and return response
  - Handle HTTP status codes

### **Controllers** (`src/backend/controllers/`)
- **Purpose**: Business logic orchestration
- **Responsibilities**:
  - Validate input data
  - Coordinate with services
  - Apply business rules
  - Return structured results

### **Services** (`src/backend/services/`)
- **Purpose**: Shared business services
- **Responsibilities**:
  - Database operations
  - External API calls
  - Complex business calculations
  - Caching and optimization

### **Models** (`src/backend/models/`)
- **Purpose**: Type definitions
- **Responsibilities**:
  - Data structure definitions
  - Interface contracts
  - Type safety across layers

### **Utils** (`src/backend/utils/`)
- **Purpose**: Helper functions
- **Responsibilities**:
  - Common utilities
  - Response formatting
  - Authentication helpers
  - Validation functions

## 🔄 **Everything Still Works The Same**

### **Frontend Experience**
- ✅ All pages work at same URLs
- ✅ All functionality preserved
- ✅ Same user experience
- ✅ Same routing behavior

### **API Experience**
- ✅ All API endpoints work the same
- ✅ Same request/response format
- ✅ Same authentication
- ✅ Same error handling

### **Developer Experience**
- ✅ Better code organization
- ✅ Easier to find code
- ✅ Better maintainability
- ✅ Cleaner separation

## 🎯 **Next Steps for Development**

### **Adding New Features**
1. **Create/update models** in `src/backend/models/`
2. **Add business logic** in controllers
3. **Create API routes** that use controllers
4. **Build frontend pages** that call APIs

### **Maintenance**
- Business logic changes → Update controllers
- Database changes → Update services
- API changes → Update routes
- UI changes → Update frontend pages

This structure provides a solid foundation for scaling the application while keeping everything organized and maintainable!
