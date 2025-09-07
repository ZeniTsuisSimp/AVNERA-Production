import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types/database';
import { OrdersController } from '@/backend/controllers/ordersController';

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const result = await OrdersController.getUserOrders(request);
  
  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(result, { status });
  }
  
  return NextResponse.json(result);
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const result = await OrdersController.createOrder(request);
  
  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 
                   result.error?.includes('Missing required fields') || 
                   result.error?.includes('Cart is empty') || 
                   result.error?.includes('Insufficient stock') ? 400 : 500;
    return NextResponse.json(result, { status });
  }
  
  return NextResponse.json(result, { status: 201 });
}
