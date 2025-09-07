import { supabaseUser } from '@/lib/supabase/config';

// Temporarily simplified types for deployment
type UserProfile = any;
type CreateUserProfile = any;
type UpdateUserProfile = any;
type UserAddress = any;
type CreateUserAddress = any;
type UpdateUserAddress = any;
type ClerkUserId = string;
type UUID = string;
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}
type QueryOptions = any;

// Get supabaseUserService - temporarily using supabaseUser
const supabaseUserService = supabaseUser;

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// =====================================================
// USER PROFILES SERVICE
// =====================================================

export class UserProfileService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: ClerkUserId): Promise<UserProfile | null> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      const { data, error } = await supabaseUser
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new DatabaseError(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Create user profile (usually called from Clerk webhook)
   */
  static async createProfile(profileData: CreateUserProfile): Promise<UserProfile> {
    if (!supabaseUserService) {
      throw new Error('User database service role not configured');
    }

    try {
      const { data, error } = await supabaseUserService
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new DatabaseError(`Failed to create user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: ClerkUserId, 
    updates: UpdateUserProfile
  ): Promise<UserProfile> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      const { data, error } = await supabaseUser
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new DatabaseError(`Failed to update user profile: ${error.message}`);
    }
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId: ClerkUserId): Promise<void> {
    if (!supabaseUserService) {
      throw new Error('User database service role not configured');
    }

    try {
      const { error } = await supabaseUserService
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw new DatabaseError(`Failed to delete user profile: ${error.message}`);
    }
  }
}

// =====================================================
// USER ADDRESSES SERVICE
// =====================================================

export class UserAddressService {
  /**
   * Get all addresses for a user
   */
  static async getUserAddresses(userId: ClerkUserId): Promise<UserAddress[]> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      const { data, error } = await supabaseUser
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user addresses:', error);
      throw new DatabaseError(`Failed to get user addresses: ${error.message}`);
    }
  }

  /**
   * Get default address for a user
   */
  static async getDefaultAddress(userId: ClerkUserId): Promise<UserAddress | null> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      const { data, error } = await supabaseUser
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting default address:', error);
      throw new DatabaseError(`Failed to get default address: ${error.message}`);
    }
  }

  /**
   * Get address by ID
   */
  static async getAddress(addressId: UUID): Promise<UserAddress | null> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      const { data, error } = await supabaseUser
        .from('user_addresses')
        .select('*')
        .eq('id', addressId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting address:', error);
      throw new DatabaseError(`Failed to get address: ${error.message}`);
    }
  }

  /**
   * Create new address
   */
  static async createAddress(addressData: CreateUserAddress): Promise<UserAddress> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      // If this is set as default, unset other default addresses
      if (addressData.is_default) {
        await this.unsetDefaultAddresses(addressData.user_id);
      }

      const { data, error } = await supabaseUser
        .from('user_addresses')
        .insert(addressData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw new DatabaseError(`Failed to create address: ${error.message}`);
    }
  }

  /**
   * Update address
   */
  static async updateAddress(
    addressId: UUID,
    updates: UpdateUserAddress
  ): Promise<UserAddress> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      // If setting as default, get user_id first and unset other defaults
      if (updates.is_default) {
        const address = await this.getAddress(addressId);
        if (address) {
          await this.unsetDefaultAddresses(address.user_id);
        }
      }

      const { data, error } = await supabaseUser
        .from('user_addresses')
        .update(updates)
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw new DatabaseError(`Failed to update address: ${error.message}`);
    }
  }

  /**
   * Delete address
   */
  static async deleteAddress(addressId: UUID): Promise<void> {
    if (!supabaseUser) {
      throw new Error('User database not configured');
    }

    try {
      const { error } = await supabaseUser
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw new DatabaseError(`Failed to delete address: ${error.message}`);
    }
  }

  /**
   * Set address as default
   */
  static async setDefaultAddress(addressId: UUID): Promise<UserAddress> {
    const address = await this.getAddress(addressId);
    if (!address) {
      throw new Error('Address not found');
    }

    // Unset other default addresses for this user
    await this.unsetDefaultAddresses(address.user_id);

    // Set this address as default
    return await this.updateAddress(addressId, { is_default: true });
  }

  /**
   * Unset all default addresses for a user (helper method)
   */
  private static async unsetDefaultAddresses(userId: ClerkUserId): Promise<void> {
    if (!supabaseUser) return;

    try {
      await supabaseUser
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    } catch (error) {
      console.error('Error unsetting default addresses:', error);
      // Don't throw error here as it's a helper method
    }
  }
}

// =====================================================
// COMBINED USER SERVICE
// =====================================================

export class UserService {
  static profile = UserProfileService;
  static address = UserAddressService;

  /**
   * Get complete user data (profile + addresses)
   */
  static async getCompleteUserData(userId: ClerkUserId) {
    try {
      const [profile, addresses] = await Promise.all([
        UserProfileService.getProfile(userId),
        UserAddressService.getUserAddresses(userId)
      ]);

      return {
        profile,
        addresses,
        defaultAddress: addresses.find(addr => addr.is_default) || null
      };
    } catch (error) {
      console.error('Error getting complete user data:', error);
      throw error;
    }
  }

  /**
   * Initialize user (create profile if it doesn't exist)
   */
  static async initializeUser(userData: {
    id: ClerkUserId;
    email: string;
    first_name?: string;
    last_name?: string;
  }): Promise<UserProfile> {
    try {
      // Check if profile exists
      let profile = await UserProfileService.getProfile(userData.id);
      
      if (!profile) {
        // Create new profile
        profile = await UserProfileService.createProfile(userData);
      }

      return profile;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }
}
