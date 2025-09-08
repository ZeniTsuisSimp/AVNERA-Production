import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { UserService } from '@/lib/services/user-service';
import type { ApiResponse } from '@/lib/types/database';

// GET /api/users/profile - Get user profile
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

    const profile = await (UserService as any).profile.getProfile(userId);
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    const updates: any = await request.json();

    // Validate required fields if needed
    if (updates.email && !updates.email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const updatedProfile = await (UserService as any).profile.updateProfile(userId, updates);

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users/profile - Initialize user profile (usually called from webhook)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const profileData = await request.json();

    // Basic validation
    if (!profileData.id || !profileData.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, email' },
        { status: 400 }
      );
    }

    const profile = await (UserService as any).initializeUser(profileData);

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
