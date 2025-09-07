import { NextRequest, NextResponse } from 'next/server';
import { getProductsServerClient } from '@/lib/supabase-multi';
import type { ApiResponse } from '@/lib/types/database';

// GET /api/products - Get products with filtering and pagination
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Build simple query options
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Get products directly from database
    const supabase = getProductsServerClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch products' },
        { status: 500 }
      );
    }

    const productsList = products || [];

    return NextResponse.json({
      success: true,
      data: productsList,
      pagination: {
        page,
        limit,
        total: productsList.length,
        totalPages: Math.ceil(productsList.length / limit)
      }
    });

  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
