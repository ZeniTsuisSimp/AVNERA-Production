import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseUser } from '@/lib/supabase/config';

export class AddressesController {
  /**
   * Get user's addresses
   */
  static async getUserAddresses(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const user = await currentUser();
      
      if (!user) {
        return { success: false, error: 'Unauthorized' };
      }
      
      if (!supabaseUser) {
        return { success: false, error: 'User database not configured' };
      }
      
      const userId = user.id;

      const { data: addresses, error: addressError } = await supabaseUser
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (addressError) {
        console.error('Error fetching addresses:', addressError);
        return { success: false, error: 'Failed to fetch addresses' };
      }

      return {
        success: true,
        data: addresses || []
      };

    } catch (error) {
      console.error('Error getting addresses:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Create a new address
   */
  static async createAddress(request: NextRequest): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const user = await currentUser();
      
      if (!user) {
        return { success: false, error: 'Unauthorized' };
      }
      
      if (!supabaseUser) {
        return { success: false, error: 'User database not configured' };
      }
      
      const userId = user.id;
      const addressData = await request.json();

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
      for (const field of requiredFields) {
        if (!addressData[field]) {
          return { success: false, error: `Missing required field: ${field}` };
        }
      }

      // If this is being set as default, update other addresses first
      if (addressData.is_default) {
        await supabaseUser
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      // Prepare address data for insertion
      const newAddressData = {
        user_id: userId,
        address_type: addressData.address_type || 'shipping',
        first_name: addressData.first_name,
        last_name: addressData.last_name,
        company: addressData.company || null,
        address_line_1: addressData.address_line_1,
        address_line_2: addressData.address_line_2 || null,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
        country: addressData.country,
        phone: addressData.phone || null,
        is_default: addressData.is_default || false
      };

      const { data: address, error: addressError } = await supabaseUser
        .from('user_addresses')
        .insert(newAddressData)
        .select()
        .single();

      if (addressError) {
        console.error('Error creating address:', addressError);
        return { success: false, error: 'Failed to create address' };
      }

      return {
        success: true,
        data: address,
        message: 'Address created successfully'
      };

    } catch (error) {
      console.error('Error creating address:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Update an existing address
   */
  static async updateAddress(addressId: string, request: NextRequest): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const user = await currentUser();
      
      if (!user) {
        return { success: false, error: 'Unauthorized' };
      }
      
      if (!supabaseUser) {
        return { success: false, error: 'User database not configured' };
      }
      
      const userId = user.id;
      const addressData = await request.json();

      // If this is being set as default, update other addresses first
      if (addressData.is_default) {
        await supabaseUser
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      // Prepare address data for update
      const updateAddressData = {
        address_type: addressData.address_type,
        first_name: addressData.first_name,
        last_name: addressData.last_name,
        company: addressData.company || null,
        address_line_1: addressData.address_line_1,
        address_line_2: addressData.address_line_2 || null,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
        country: addressData.country,
        phone: addressData.phone || null,
        is_default: addressData.is_default || false
      };

      const { data: address, error: addressError } = await supabaseUser
        .from('user_addresses')
        .update(updateAddressData)
        .eq('id', addressId)
        .eq('user_id', userId) // Ensure user can only update their own addresses
        .select()
        .single();

      if (addressError) {
        console.error('Error updating address:', addressError);
        return { success: false, error: 'Failed to update address' };
      }

      if (!address) {
        return { success: false, error: 'Address not found' };
      }

      return {
        success: true,
        data: address,
        message: 'Address updated successfully'
      };

    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const user = await currentUser();
      
      if (!user) {
        return { success: false, error: 'Unauthorized' };
      }
      
      if (!supabaseUser) {
        return { success: false, error: 'User database not configured' };
      }
      
      const userId = user.id;

      // Check if this is the default address
      const { data: addressCheck } = await supabaseUser
        .from('user_addresses')
        .select('is_default')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (addressCheck?.is_default) {
        return { success: false, error: 'Cannot delete default address' };
      }

      const { error: addressError } = await supabaseUser
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId); // Ensure user can only delete their own addresses

      if (addressError) {
        console.error('Error deleting address:', addressError);
        return { success: false, error: 'Failed to delete address' };
      }

      return {
        success: true,
        message: 'Address deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false, error: 'Internal server error' };
    }
  }
}
