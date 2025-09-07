export interface Address {
  id: string;
  user_id: string;
  address_type: 'shipping' | 'billing' | 'both';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressRequest {
  address_type?: 'shipping' | 'billing' | 'both';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  // All fields are optional for updates
}
