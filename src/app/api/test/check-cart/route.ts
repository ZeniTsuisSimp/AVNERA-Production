import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ProductsService } from '@/lib/services/products-service';

export async function GET(): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User must be logged in'
      }, { status: 401 });
    }

    const userId = user.id;
    
    // Get user cart
    const { data: cartItems, error: cartError } = await ProductsService.getUserCart(userId, null);
    
    return NextResponse.json({
      success: true,
      data: {
        user_id: userId,
        cart_items: cartItems,
        cart_count: cartItems?.length || 0,
        error: cartError?.message || null
      }
    });

  } catch (error) {
    console.error('Error checking cart:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
