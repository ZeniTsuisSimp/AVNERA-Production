import { supabaseOrders, supabaseProducts, supabaseUser } from '@/lib/supabase/config';

export class DatabaseService {
  /**
   * Get the orders database client
   */
  static getOrdersDB() {
    if (!supabaseOrders) {
      throw new Error('Orders database not configured');
    }
    return supabaseOrders;
  }

  /**
   * Get the products database client
   */
  static getProductsDB() {
    if (!supabaseProducts) {
      throw new Error('Products database not configured');
    }
    return supabaseProducts;
  }

  /**
   * Get the user database client
   */
  static getUserDB() {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }
    return supabaseUser;
  }

  /**
   * Check database connections
   */
  static async checkConnections() {
    const status = {
      orders: false,
      products: false,
      user: false
    };

    try {
      if (supabaseOrders) {
        await (supabaseOrders as any).from('orders').select('id').limit(1);
        status.orders = true;
      }
    } catch (error) {
      console.error('Orders DB connection failed:', error);
    }

    try {
      if (supabaseProducts) {
        await (supabaseProducts as any).from('products').select('id').limit(1);
        status.products = true;
      }
    } catch (error) {
      console.error('Products DB connection failed:', error);
    }

    try {
      if (supabaseUser) {
        await (supabaseUser as any).from('user_profiles').select('id').limit(1);
        status.user = true;
      }
    } catch (error) {
      console.error('User DB connection failed:', error);
    }

    return status;
  }
}
