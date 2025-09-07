import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseProducts } from '@/lib/supabase/config';
import type { ApiResponse } from '@/lib/types/database';

// GET /api/cart - Get user's cart items
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    // Get cart items directly from Supabase
    if (!supabaseProducts) {
      console.warn('Products database not configured, returning empty cart');
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          itemCount: 0,
          totalPrice: 0
        },
        warning: 'Database not configured - using fallback mode'
      });
    }

    const { data: cartItems, error } = await supabaseProducts
      .from('shopping_cart')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    const items = cartItems || [];
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => {
      return total + (item.quantity * (item.products?.price || 0));
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        itemCount,
        totalPrice
      }
    });

  } catch (error) {
    console.error('Error getting cart items:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  console.log('POST /api/cart - Request received');
  
  try {
    const user = await currentUser();
    console.log('User check result:', user ? 'authenticated' : 'not authenticated');
    
    if (!user) {
      console.log('Returning 401 - User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in to add items to cart' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body parsed:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { product_id, quantity = 1 }: { product_id: string; quantity?: number } = requestBody;

    if (!product_id) {
      console.log('Missing product_id in request');
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Processing add to cart for product_id:', product_id, 'quantity:', quantity);
    
    // Validate UUID format for product_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(product_id)) {
      console.log('Invalid product_id format. Expected UUID, got:', product_id);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID format. Please use a valid product UUID.',
          details: 'Product IDs must be in UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)'
        },
        { status: 400 }
      );
    }

    if (!supabaseProducts) {
      console.warn('Products database not configured, simulating add to cart');
      return NextResponse.json({
        success: true,
        data: {
          id: `cart-${Date.now()}`,
          user_id: userId,
          product_id,
          quantity,
          created_at: new Date().toISOString()
        },
        warning: 'Database not configured - item not actually stored',
        message: 'Item added to cart successfully (simulation mode)'
      });
    }
    
    console.log('Database is configured, proceeding with product verification');

    // Verify product exists
    console.log('Verifying product exists for ID:', product_id);
    const { data: product, error: productError } = await supabaseProducts
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError) {
      console.error('Product verification error:', productError);
      
      if (productError.code === 'PGRST116') {
        // Product not found
        console.log('Product not found for ID:', product_id);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Product not found',
            details: 'The selected product is no longer available. Please refresh the page and try again.',
            code: 'PRODUCT_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Product verification failed: ${productError.message}` },
        { status: 500 }
      );
    }
    
    if (!product) {
      console.log('Product not found for ID:', product_id);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('Product found:', product.name, 'Stock:', product.stock_quantity);

    // Check stock availability for new cart items
    if (product.stock_quantity < quantity) {
      console.log('Insufficient stock. Available:', product.stock_quantity, 'Requested:', quantity);
      return NextResponse.json(
        { 
          success: false, 
          error: `Only ${product.stock_quantity} ${product.name} available in stock. Cannot add ${quantity} items.`,
          details: {
            product_name: product.name,
            requested_quantity: quantity,
            available_stock: product.stock_quantity
          }
        },
        { status: 400 }
      );
    }
    
    // Check if product is out of stock
    if (product.stock_quantity === 0) {
      console.log('Product is out of stock');
      return NextResponse.json(
        { 
          success: false, 
          error: `${product.name} is currently out of stock.`,
          details: {
            product_name: product.name,
            available_stock: 0
          }
        },
        { status: 400 }
      );
    }
    
    console.log('Initial stock check passed. Checking for existing cart item.');

    // Check if item already exists in cart
    const { data: existingItem } = await supabaseProducts
      .from('shopping_cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();
      
    console.log('Existing cart item check result:', existingItem ? 'found' : 'not found');

    let cartItem;
    
    if (existingItem) {
      // Check if total quantity (existing + new) exceeds available stock
      const totalQuantity = existingItem.quantity + quantity;
      console.log(`Stock validation: Current in cart: ${existingItem.quantity}, Adding: ${quantity}, Total: ${totalQuantity}, Available: ${product.stock_quantity}`);
      
      if (totalQuantity > product.stock_quantity) {
        console.log('Total quantity exceeds available stock');
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot add ${quantity} more items. You already have ${existingItem.quantity} in cart. Only ${product.stock_quantity} available.`,
            details: {
              requested_quantity: quantity,
              current_in_cart: existingItem.quantity,
              total_requested: totalQuantity,
              available_stock: product.stock_quantity,
              max_can_add: product.stock_quantity - existingItem.quantity
            }
          },
          { status: 400 }
        );
      }
      
      // Update quantity
      const { data, error } = await supabaseProducts
        .from('shopping_cart')
        .update({ quantity: totalQuantity })
        .eq('id', existingItem.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating cart item:', error);
        return NextResponse.json(
          { success: false, error: `Failed to update cart item: ${error.message}` },
          { status: 500 }
        );
      }
      cartItem = data;
    } else {
      // Create new cart item
      const { data, error } = await supabaseProducts
        .from('shopping_cart')
        .insert({
          user_id: userId,
          product_id,
          quantity
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating cart item:', error);
        return NextResponse.json(
          { success: false, error: `Failed to add item to cart: ${error.message}` },
          { status: 500 }
        );
      }
      cartItem = data;
    }

    console.log('Cart operation completed successfully. Returning response.');
    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear user's cart
export async function DELETE(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    if (!supabaseProducts) {
      console.warn('Products database not configured, simulating cart clear');
      return NextResponse.json({
        success: true,
        warning: 'Database not configured - cart not actually cleared',
        message: 'Cart cleared successfully (simulation mode)'
      });
    }

    const { error } = await supabaseProducts
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
