import { currentUser } from '@clerk/nextjs/server';

export class AuthUtils {
  /**
   * Get the current authenticated user
   */
  static async getCurrentUser() {
    try {
      const user = await currentUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated() {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Get user ID safely
   */
  static async getUserId() {
    const user = await this.getCurrentUser();
    return user?.id || null;
  }

  /**
   * Validate user ownership of a resource
   */
  static async validateUserOwnership(resourceUserId: string) {
    const currentUserId = await this.getUserId();
    return currentUserId === resourceUserId;
  }
}
