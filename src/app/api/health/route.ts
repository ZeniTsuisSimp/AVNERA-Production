import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/backend/services/databaseService';

export async function GET(): Promise<NextResponse> {
  try {
    const connections = await DatabaseService.checkConnections();
    
    return NextResponse.json({
      success: true,
      message: 'Backend is healthy',
      data: {
        timestamp: new Date().toISOString(),
        structure: {
          frontend: 'src/app/(frontend)/',
          backend: 'src/backend/',
          api: 'src/app/api/'
        },
        databases: connections
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Backend health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
