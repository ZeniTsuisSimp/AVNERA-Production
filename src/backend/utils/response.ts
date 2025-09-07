import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types/database';

export class ResponseUtils {
  /**
   * Create a success response
   */
  static success<T = any>(data?: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message
    }, { status });
  }

  /**
   * Create an error response
   */
  static error(error: string, status = 500): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error
    }, { status });
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(message = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 401);
  }

  /**
   * Create a bad request response
   */
  static badRequest(message = 'Bad Request'): NextResponse<ApiResponse> {
    return this.error(message, 400);
  }

  /**
   * Create a not found response
   */
  static notFound(message = 'Not Found'): NextResponse<ApiResponse> {
    return this.error(message, 404);
  }

  /**
   * Create an internal server error response
   */
  static internalServerError(message = 'Internal Server Error'): NextResponse<ApiResponse> {
    return this.error(message, 500);
  }

  /**
   * Create a created response
   */
  static created<T = any>(data?: T, message = 'Created successfully'): NextResponse<ApiResponse<T>> {
    return this.success(data, message, 201);
  }
}
