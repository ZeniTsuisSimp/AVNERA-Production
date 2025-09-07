'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Home, Building2, Loader2 } from 'lucide-react';

interface Address {
  id: string;
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

const AddressesPage = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    address_type: 'shipping',
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
    is_default: false
  });

  // Fetch addresses from API
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/addresses');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch addresses');
      }
      
      setAddresses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/addresses?id=${editingId}` : '/api/addresses';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to save address');
      }
      
      // Refresh addresses list
      await fetchAddresses();
      
      // Reset form and close editor
      resetForm();
      setIsAddingNew(false);
      setEditingId(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setNewAddress({
      address_type: 'shipping',
      first_name: '',
      last_name: '',
      company: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      phone: '',
      is_default: false
    });
  };

  const handleEdit = (address: Address) => {
    setNewAddress(address);
    setEditingId(address.id);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete address');
      }
      
      // Refresh addresses list
      await fetchAddresses();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setError(null);
      const address = addresses.find(addr => addr.id === id);
      if (!address) return;
      
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...address, is_default: true }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to set default address');
      }
      
      // Refresh addresses list
      await fetchAddresses();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'shipping': return <Home className="w-4 h-4" />;
      case 'billing': return <Building2 className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'shipping': return 'text-green-600 bg-green-100';
      case 'billing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-gold animate-spin mr-2" />
          <span className="text-gray-600">Loading addresses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-brand text-charcoal">Addresses</h1>
          <p className="text-gray-600 mt-1">Manage your shipping and billing addresses</p>
        </div>
        
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Add/Edit Address Form */}
      {isAddingNew && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
              </label>
              <select
                name="address_type"
                value={newAddress.address_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              >
                <option value="shipping">Shipping</option>
                <option value="billing">Billing</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* First Name & Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={newAddress.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={newAddress.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            {/* Company (Optional) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                name="company"
                value={newAddress.company}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            {/* Address Line 1 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                name="address_line_1"
                value={newAddress.address_line_1}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            {/* Address Line 2 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                name="address_line_2"
                value={newAddress.address_line_2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            {/* City, State, ZIP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                name="postal_code"
                value={newAddress.postal_code}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                name="country"
                value={newAddress.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={newAddress.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
              />
            </div>

            {/* Default Address Checkbox */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={newAddress.is_default}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold"
                />
                <span className="ml-2 text-sm text-gray-700">Set as default address</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  submitting 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-gold text-white hover:bg-secondary-gold'
                }`}
              >
                {submitting ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className="border border-gray-200 rounded-lg p-6">
            {/* Address Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getAddressTypeColor(address.address_type)}`}>
                  {getAddressTypeIcon(address.address_type)}
                  <span className="capitalize">{address.address_type}</span>
                </span>
                
                {address.is_default && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-primary-gold bg-yellow-100">
                    Default
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(address)}
                  className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                  title="Edit address"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete address"
                  disabled={address.is_default}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Address Details */}
            <div className="text-gray-900 space-y-1">
              <div className="font-medium">
                {address.first_name} {address.last_name}
              </div>
              
              {address.company && (
                <div className="text-gray-600">{address.company}</div>
              )}
              
              <div>{address.address_line_1}</div>
              {address.address_line_2 && <div>{address.address_line_2}</div>}
              
              <div>
                {address.city}, {address.state} {address.postal_code}
              </div>
              
              <div>{address.country}</div>
              
              {address.phone && (
                <div className="text-gray-600 pt-2">
                  Phone: {address.phone}
                </div>
              )}
            </div>

            {/* Address Actions */}
            {!address.is_default && (
              <button
                onClick={() => handleSetDefault(address.id)}
                className="mt-4 text-sm text-primary-gold hover:text-secondary-gold transition-colors"
              >
                Set as default
              </button>
            )}
          </div>
        ))}
      </div>

      {addresses.length === 0 && !isAddingNew && (
        <div className="text-center py-12">
          <MapPin className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-6">Add your first address to speed up checkout</p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
