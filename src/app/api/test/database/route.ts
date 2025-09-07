import { NextResponse } from 'next/server';
import { supabaseOrders, supabaseProducts } from '@/lib/supabase/config';

interface DatabaseOperations {
  serviceAvailable?: boolean;
  methods?: string[];
  dataTest?: {
    categoriesFound?: number;
    productsFound?: number;
    sampleCategory?: string;
    sampleProduct?: string;
  };
  error?: string;
}

interface DatabaseTestResult {
  connected: boolean;
  error: string | null;
  operations: DatabaseOperations;
}

// GET /api/test/database - Test database connections
export async function GET(): Promise<NextResponse> {
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: {
      ordersUrl: !!process.env.NEXT_PUBLIC_SUPABASE_ORDERS_URL,
      ordersAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY,
      ordersServiceRole: !!process.env.SUPABASE_ORDERS_SERVICE_ROLE_KEY &&
                        !process.env.SUPABASE_ORDERS_SERVICE_ROLE_KEY.startsWith('your-'),
      productsUrl: !!process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL,
      productsAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY,
      productsServiceRole: !!process.env.SUPABASE_PRODUCTS_SERVICE_ROLE_KEY &&
                          !process.env.SUPABASE_PRODUCTS_SERVICE_ROLE_KEY.startsWith('your-')
    },
    connections: {
      orders: { connected: false, error: null as string | null },
      products: { connected: false, error: null as string | null }
    },
    issues: [] as string[]
  };

  // Test Orders Database
  try {
    if (!supabaseOrders) {
      testResults.connections.orders.error = 'Orders database not configured';
      testResults.issues.push('Orders DB: Not configured');
    } else {
      const { data, error } = await supabaseOrders
      .from('orders')
      .select('id')
      .limit(1);
    
      testResults.connections.orders.connected = !error;
      if (error) {
        testResults.connections.orders.error = error.message;
        testResults.issues.push(`Orders DB: ${error.message}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    testResults.connections.orders.error = errorMessage;
    testResults.issues.push(`Orders DB: ${errorMessage}`);
  }

  // Test Products Database
  try {
    if (!supabaseProducts) {
      testResults.connections.products.error = 'Products database not configured';
      testResults.issues.push('Products DB: Not configured');
    } else {
      const { data, error } = await supabaseProducts
      .from('products')
      .select('id')
      .limit(1);
    
      testResults.connections.products.connected = !error;
      if (error) {
        testResults.connections.products.error = error.message;
        testResults.issues.push(`Products DB: ${error.message}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    testResults.connections.products.error = errorMessage;
    testResults.issues.push(`Products DB: ${errorMessage}`);
  }

  // Add environment issues
  if (!testResults.environment.ordersServiceRole) {
    testResults.issues.push('Orders service role key not configured');
  }
  if (!testResults.environment.productsServiceRole) {
    testResults.issues.push('Products service role key not configured');
  }

  const statusCode = testResults.issues.length === 0 ? 200 : 500;
  
  return NextResponse.json(testResults, { status: statusCode });
}

// POST /api/test/database - Test database write operations
export async function POST(): Promise<NextResponse> {
  const testResults = {
    timestamp: new Date().toISOString(),
    writeTests: {
      products: { success: false, error: null as string | null },
      orders: { success: false, error: null as string | null }
    },
    message: ''
  };

  // Test Products write
  try {
    if (!supabaseProducts) {
      testResults.writeTests.products.error = 'Products database not configured';
    } else {
    const testCategory = {
      name: `Test Category ${Date.now()}`,
      slug: `test-category-${Date.now()}`,
      is_active: true
    };

      const { data, error } = await supabaseProducts
      .from('categories')
      .insert(testCategory)
      .select()
      .single();

      if (error) {
        testResults.writeTests.products.error = error.message;
      } else {
        testResults.writeTests.products.success = true;
        // Clean up - delete test category
        await supabaseProducts.from('categories').delete().eq('id', data.id);
      }
    }
  } catch (error) {
    testResults.writeTests.products.error = (error as Error).message;
  }

  // Test Orders write
  try {
    if (!supabaseOrders) {
      testResults.writeTests.orders.error = 'Orders database not configured';
    } else {
    const testOrder = {
      user_id: `test-user-${Date.now()}`,
      total_amount: 100,
      currency: 'INR',
      status: 'pending',
      shipping_address: '123 Test St, Test City, Test State 12345'
    };

      const { data, error } = await supabaseOrders
      .from('orders')
      .insert(testOrder)
      .select()
      .single();

      if (error) {
        testResults.writeTests.orders.error = error.message;
      } else {
        testResults.writeTests.orders.success = true;
        // Clean up - delete test order
        await supabaseOrders.from('orders').delete().eq('id', data.id);
      }
    }
  } catch (error) {
    testResults.writeTests.orders.error = (error as Error).message;
  }

  const successCount = Object.values(testResults.writeTests).filter(test => test.success).length;
  const totalTests = Object.keys(testResults.writeTests).length;
  
  testResults.message = `${successCount}/${totalTests} write tests passed`;
  
  return NextResponse.json(testResults, { 
    status: successCount === totalTests ? 200 : 500 
  });
}
