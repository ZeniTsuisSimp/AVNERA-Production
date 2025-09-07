'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, AlertCircle, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

const AddToCartButton = ({ productId, productName, className = '' }: AddToCartButtonProps) => {
  const { user } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<{message: string; details?: any} | null>(null);
  
  // Debug error state
  console.log('Current error state:', error);

  // Error popup stays visible until manually closed
  // No auto-dismiss functionality

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please sign in to add items to cart');
      return;
    }

    setIsAdding(true);
    setError(null); // Clear any previous errors
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_id: productId,
          quantity: 1 
        })
      });

      const result = await response.json();

      if (result.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000); // Reset after 2 seconds
        
        if (result.warning) {
          console.warn('Cart API warning:', result.warning);
        }
      } else {
        // Handle API errors with details
        console.log('API Error Result:', result);
        console.log('Setting error state with:', {
          message: result.error || 'Failed to add to cart',
          details: result.details
        });
        setError({ 
          message: result.error || 'Failed to add to cart',
          details: result.details 
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError({ 
        message: 'Failed to add to cart. Please try again.',
        details: null 
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}
      >
        {isAdding ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Adding...</span>
          </>
        ) : added ? (
          <>
            <Plus className="w-4 h-4 text-green-300" />
            <span>Added!</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
      
      {/* Inline Error Popup */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">Stock Alert</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <p className="text-gray-800 text-xs font-medium mb-2">{error.message}</p>
              
              {error.details && (
                <div className="space-y-1.5 text-xs">
                  {error.details.available_stock !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {error.details.available_stock}
                      </span>
                    </div>
                  )}
                  
                  {error.details.current_in_cart !== undefined && error.details.current_in_cart > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">In Cart:</span>
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {error.details.current_in_cart}
                      </span>
                    </div>
                  )}
                  
                  {error.details.max_can_add !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Can Add:</span>
                      <span className={`font-semibold px-2 py-0.5 rounded ${
                        error.details.max_can_add > 0 
                          ? 'text-green-700 bg-green-50' 
                          : 'text-red-700 bg-red-50'
                      }`}>
                        {error.details.max_can_add > 0 ? error.details.max_can_add : '0'}
                      </span>
                    </div>
                  )}
                  
                  {error.details.available_stock === 0 && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-xs text-red-700 font-medium text-center">
                        🚫 Out of Stock
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddToCartButton;
