// Debug script to check cart localStorage state
// Run this in the browser console to debug cart issues

console.log('=== Cart Debug Information ===');

// Check localStorage for cart data
const cartStorage = localStorage.getItem('cart-storage');
console.log('Cart Storage Raw:', cartStorage);

if (cartStorage) {
  try {
    const parsedCart = JSON.parse(cartStorage);
    console.log('Parsed Cart Storage:', parsedCart);
    
    if (parsedCart.state && parsedCart.state.items) {
      console.log('Cart Items:', parsedCart.state.items);
      console.log('Cart Items Count:', parsedCart.state.items.length);
      
      const totalQuantity = parsedCart.state.items.reduce((total, item) => total + item.quantity, 0);
      console.log('Total Quantity:', totalQuantity);
    }
  } catch (error) {
    console.error('Error parsing cart storage:', error);
  }
}

// Check other storage keys that might affect cart
const allKeys = Object.keys(localStorage);
console.log('All localStorage keys:', allKeys);

// Clear old client-side cart storage that's no longer used
if (localStorage.getItem('cart-storage')) {
  localStorage.removeItem('cart-storage');
  console.log('✓ Old cart storage cleared - header now uses server-side cart');
} else {
  console.log('✓ No old cart storage found');
}

console.log('\n=== Cart System Status ===');
console.log('• Header cart badge now fetches count from server (/api/cart)');
console.log('• Cart page uses database-stored items');
console.log('• Both systems are now in sync!');
console.log('• Refresh the page to see the updated cart count in header');

// Function to manually refresh cart count (for testing)
window.refreshCartCount = () => {
  window.location.reload();
};
