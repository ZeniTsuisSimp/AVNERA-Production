import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types/database';
import { AddressesController } from '@/backend/controllers/addressesController';

// GET /api/addresses - Get user's addresses
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const result = await AddressesController.getUserAddresses();
  
  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(result, { status });
  }
  
  return NextResponse.json(result);
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const result = await AddressesController.createAddress(request);
  
  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 
                   result.error?.includes('Missing required field') ? 400 : 500;
    return NextResponse.json(result, { status });
  }
  
  return NextResponse.json(result, { status: 201 });
}

// PUT /api/addresses - Update address
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const { searchParams } = new URL(request.url);
  const addressId = searchParams.get('id');
  
  if (!addressId) {
    return NextResponse.json(
      { success: false, error: 'Address ID is required' },
      { status: 400 }
    );
  }

  const result = await AddressesController.updateAddress(addressId, request);
  
  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 
                   result.error === 'Address not found' ? 404 : 500;
    return NextResponse.json(result, { status });
  }
  
  return NextResponse.json(result);
}

// DELETE /api/addresses - Delete address
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const { searchParams } = new URL(request.url);
  const addressId = searchParams.get('id');
  
  if (!addressId) {
    return NextResponse.json(
      { success: false, error: 'Address ID is required' },
      { status: 400 }
    );
  }

  const result = await AddressesController.deleteAddress(addressId);
  
  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 
                   result.error === 'Cannot delete default address' ? 400 : 500;
    return NextResponse.json(result, { status });
  }
  
  return NextResponse.json(result);
}
