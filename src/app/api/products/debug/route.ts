import { NextResponse } from 'next/server';

// GET /api/products/debug - Debug version of products API
export async function GET(): Promise<NextResponse> {
  try {
    console.log('Debug: Starting products API call...');
    
    // Simple mock response for now to fix build
    const products: any[] = [];
    
    console.log('Debug: Products fetched:', products.length);
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Debug: Error in products API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      success: false,
      error: message,
      stack: stack
    }, { status: 500 });
  }
}
