import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseProducts } from '@/lib/supabase/config';

// PUT /api/cart/[itemId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quantity } = await request.json();
    const { itemId } = await params;
    const userId = user.id;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    if (!supabaseProducts) {
      return NextResponse.json(
        { success: false, error: 'Products database not configured' },
        { status: 500 }
      );
    }

    // Get current cart item with product information
    const { data: cartItem, error: cartError } = await supabaseProducts
      .from('shopping_cart')
      .select(`
        *,
        products(*)
      `)
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (cartError || !cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    const product = (cartItem as any).products;
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock availability
    if (quantity > product.stock_quantity) {
      const maxCanAdd = Math.max(0, product.stock_quantity - (cartItem as any).quantity);
      return NextResponse.json(
        { 
          success: false, 
          error: `Only ${product.stock_quantity} ${product.name} available in stock. Cannot set quantity to ${quantity}.`,
          details: {
            product_name: product.name,
            requested_quantity: quantity,
            available_stock: product.stock_quantity,
            current_in_cart: (cartItem as any).quantity,
            max_can_add: maxCanAdd
          }
        },
        { status: 400 }
      );
    }

    if (product.stock_quantity === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${product.name} is currently out of stock.`,
          details: {
            product_name: product.name,
            available_stock: 0,
            current_in_cart: (cartItem as any).quantity
          }
        },
        { status: 400 }
      );
    }

    // Update the cart item
    const { data, error } = await supabaseProducts
      .from('shopping_cart')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      } as never)
      .eq('id', itemId)
      .eq('user_id', userId) // Ensure user can only update their own cart items
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[itemId] - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    const userId = user.id;
    if (!supabaseProducts) {
      return NextResponse.json(
        { success: false, error: 'Products database not configured' },
        { status: 500 }
      );
    }

    // Delete the cart item
    const { error } = await supabaseProducts
      .from('shopping_cart')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId); // Ensure user can only delete their own cart items

    if (error) {
      throw new Error(`Failed to remove cart item: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Cart item removed successfully'
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
