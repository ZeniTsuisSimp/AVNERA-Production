import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getProductsClient } from '@/lib/supabase-multi';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User must be logged in to add items to cart'
      }, { status: 401 });
    }

    const userId = user.id;
    const productsClient = getProductsClient();

    // Get the first product
    const { data: products, error: productsError } = await productsClient
      .from('products')
      .select('id, name, price')
      .eq('status', 'active')
      .limit(2);

    if (productsError || !products || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No products found. Please create products first.'
      }, { status: 400 });
    }

    // Add first two products to cart
    const cartItems = [];
    for (let i = 0; i < Math.min(2, products.length); i++) {
      const product = products[i];
      const { data: cartItem, error: cartError } = await productsClient
        .from('shopping_cart')
        .insert({
          user_id: userId,
          product_id: product.id,
          quantity: i + 1 // Add 1 of first product, 2 of second
        })
        .select()
        .single();

      if (cartError && cartError.code !== '23505') { // Ignore duplicate errors
        console.error(`Cart error for product ${product.name}:`, cartError);
      } else {
        cartItems.push({
          product_name: product.name,
          quantity: i + 1,
          price: product.price
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Items added to cart successfully',
      data: {
        user_id: userId,
        cart_items: cartItems
      }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
