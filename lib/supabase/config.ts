import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Environment variables validation
const requiredEnvVars = {
  user: {
    url: process.env.NEXT_PUBLIC_SUPABASE_USER_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_USER_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_USER_SERVICE_ROLE_KEY,
  },
  orders: {
    url: process.env.NEXT_PUBLIC_SUPABASE_ORDERS_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ORDERS_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_ORDERS_SERVICE_ROLE_KEY,
  },
  products: {
    url: process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_PRODUCTS_SERVICE_ROLE_KEY,
  },
};

// Validate environment variables
function validateEnvVars() {
  const missing: string[] = [];
  
  Object.entries(requiredEnvVars).forEach(([dbName, config]) => {
    if (!config.url) missing.push(`NEXT_PUBLIC_SUPABASE_${dbName.toUpperCase()}_URL`);
    if (!config.anonKey) missing.push(`NEXT_PUBLIC_SUPABASE_${dbName.toUpperCase()}_ANON_KEY`);
  });

  if (missing.length > 0) {
    console.warn(`⚠️ Missing Supabase environment variables: ${missing.join(', ')}`);
    console.warn('Please check your .env.local file and ensure all databases are configured.');
  }
}

// Initialize validation
validateEnvVars();

// Database Types
export type Database = 'user' | 'orders' | 'products';

// Client cache for reuse
const clientCache = new Map<string, SupabaseClient>();

/**
 * Create a Supabase client for a specific database
 */
function createSupabaseClient(
  database: Database,
  useServiceRole = false
): SupabaseClient | null {
  const config = requiredEnvVars[database];
  
  if (!config.url || !config.anonKey) {
    console.error(`Missing configuration for ${database} database`);
    return null;
  }

  const key = useServiceRole ? config.serviceRoleKey : config.anonKey;
  const cacheKey = `${database}-${useServiceRole ? 'service' : 'anon'}`;

  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  if (useServiceRole && !config.serviceRoleKey) {
    console.error(`Missing service role key for ${database} database`);
    return null;
  }

  const client = createClient(config.url, key!, {
    auth: {
      autoRefreshToken: true,
      persistSession: typeof window !== 'undefined',
    },
  });

  clientCache.set(cacheKey, client);
  return client;
}

/**
 * Create a browser client for client-side operations
 */
function createSupabaseBrowserClient(database: Database): SupabaseClient | null {
  const config = requiredEnvVars[database];
  
  if (!config.url || !config.anonKey) {
    console.error(`Missing configuration for ${database} database`);
    return null;
  }

  const cacheKey = `${database}-browser`;
  
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const client = createBrowserClient(config.url, config.anonKey);
  clientCache.set(cacheKey, client);
  return client;
}

// Export database clients
export const supabaseUser = createSupabaseClient('user');
export const supabaseOrders = createSupabaseClient('orders');
export const supabaseProducts = createSupabaseClient('products');

// Service role clients (for server-side operations)
export const supabaseUserService = createSupabaseClient('user', true);
export const supabaseOrdersService = createSupabaseClient('orders', true);
export const supabaseProductsService = createSupabaseClient('products', true);

// Browser clients (for client-side operations)
export const supabaseUserBrowser = createSupabaseBrowserClient('user');
export const supabaseOrdersBrowser = createSupabaseBrowserClient('orders');
export const supabaseProductsBrowser = createSupabaseBrowserClient('products');

/**
 * Get a specific database client
 */
export function getSupabaseClient(
  database: Database,
  useServiceRole = false,
  useBrowserClient = false
): SupabaseClient | null {
  if (useBrowserClient) {
    return createSupabaseBrowserClient(database);
  }
  return createSupabaseClient(database, useServiceRole);
}

/**
 * Configuration object for easy access
 */
export const databaseConfig = {
  user: {
    url: requiredEnvVars.user.url,
    anonKey: requiredEnvVars.user.anonKey,
    client: supabaseUser,
    serviceClient: supabaseUserService,
    browserClient: supabaseUserBrowser,
  },
  orders: {
    url: requiredEnvVars.orders.url,
    anonKey: requiredEnvVars.orders.anonKey,
    client: supabaseOrders,
    serviceClient: supabaseOrdersService,
    browserClient: supabaseOrdersBrowser,
  },
  products: {
    url: requiredEnvVars.products.url,
    anonKey: requiredEnvVars.products.anonKey,
    client: supabaseProducts,
    serviceClient: supabaseProductsService,
    browserClient: supabaseProductsBrowser,
  },
};

export default databaseConfig;
