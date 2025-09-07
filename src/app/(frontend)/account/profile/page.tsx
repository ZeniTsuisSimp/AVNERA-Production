'use client';

import { useState } from 'react';
import { Camera, Save, X } from 'lucide-react';
import RecentOrders from '@/components/account/RecentOrders';
import AccountStats from '@/components/account/AccountStats';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    bio: 'Fashion enthusiast and style blogger. Love discovering new trends and sharing outfit inspirations.'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setIsEditing(false);
    // Show success message
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      bio: 'Fashion enthusiast and style blogger. Love discovering new trends and sharing outfit inspirations.'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-brand text-charcoal">Profile Information</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-gold text-white rounded-lg hover:bg-secondary-gold transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-primary-gold rounded-full flex items-center justify-center text-white font-semibold text-xl">
                JD
              </div>
            </div>
            {isEditing && (
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-gold text-white rounded-full flex items-center justify-center hover:bg-secondary-gold transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Profile Photo</h3>
            <p className="text-sm text-gray-500 mt-1">
              JPG, GIF or PNG. Max size 2MB.
            </p>
            {isEditing && (
              <button
                type="button"
                className="mt-2 text-sm text-primary-gold hover:text-secondary-gold"
              >
                Upload new photo
              </button>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isEditing 
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary-gold focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isEditing 
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary-gold focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isEditing 
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary-gold focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
            {!isEditing && (
              <p className="text-sm text-gray-500 mt-1">
                Verified • Primary email address
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isEditing 
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary-gold focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isEditing 
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary-gold focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isEditing 
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary-gold focus:border-transparent' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            disabled={!isEditing}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg transition-colors resize-none ${
              isEditing 
                ? 'border-gray-300 focus:ring-2 focus:ring-primary-gold focus:border-transparent' 
                : 'border-gray-200 bg-gray-50'
            }`}
            placeholder="Tell us about yourself..."
          />
          {isEditing && (
            <p className="text-sm text-gray-500 mt-1">
              Maximum 500 characters
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-gold text-white hover:bg-secondary-gold'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </form>

      {/* Account Overview */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Statistics */}
          <div>
            <AccountStats />
          </div>
          
          {/* Recent Orders */}
          <div>
            <RecentOrders />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
