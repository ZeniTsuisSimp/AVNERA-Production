import { NextRequest, NextResponse } from 'next/server'

// Simple test route to verify API functionality
export async function GET() {
  return NextResponse.json({
    message: 'Test cart API is working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: 'POST request received successfully',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to parse request body',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}
