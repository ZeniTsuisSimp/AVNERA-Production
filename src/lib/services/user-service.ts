import { getUserClient, getUserServerClient, User, UserAddress } from '@/lib/supabase-multi'

export class UserService {
  // Create user profile (called from Clerk webhook or initialization)
  static async createUserProfile(
    userId: string,
    email: string,
    firstName: string = '',
    lastName: string = ''
  ) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName
      })
      .select()
      .single()

    return { data, error }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }

  // Get user addresses
  static async getUserAddresses(userId: string) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Add user address
  static async addUserAddress(userId: string, address: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        ...address
      })
      .select()
      .single()

    return { data, error }
  }

  // Update user address
  static async updateUserAddress(addressId: string, updates: Partial<UserAddress>) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single()

    return { data, error }
  }

  // Delete user address
  static async deleteUserAddress(addressId: string) {
    const supabase = getUserClient()
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)

    return { error }
  }

  // Set default address
  static async setDefaultAddress(userId: string, addressId: string) {
    const supabase = getUserClient()
    
    // First, unset all default addresses for the user
    const { error: unsetError } = await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)

    if (unsetError) {
      return { error: unsetError }
    }

    // Then set the new default address
    const { data, error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single()

    return { data, error }
  }

  // Get user preferences
  static async getUserPreferences(userId: string) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  }

  // Update user preferences
  static async updateUserPreferences(userId: string, preferences: any) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      })
      .select()
      .single()

    return { data, error }
  }

  // Get user activity logs
  static async getUserActivityLogs(userId: string, limit = 50) {
    const supabase = getUserClient()
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }

  // Log user activity (server-side)
  static async logUserActivity(
    userId: string,
    activityType: string,
    description?: string,
    metadata?: any
  ) {
    const supabase = getUserServerClient()
    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_description: description,
        metadata
      })

    return { data, error }
  }
}
