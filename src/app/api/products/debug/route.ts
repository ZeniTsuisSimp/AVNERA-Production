import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/products-service';

// GET /api/products/debug - Debug version of products API
export async function GET(): Promise<NextResponse> {
  try {
    console.log('Debug: Starting products API call...');
    
    // Simple call without complex options
    const products = await ProductsService.product.getProducts({ limit: 10 });
    
    console.log('Debug: Products fetched:', products.length);
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Debug: Error in products API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
}
