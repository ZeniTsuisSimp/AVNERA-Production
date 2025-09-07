'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Heart, Menu, X, Bell } from 'lucide-react';
import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { useWishlistStore, useUIStore } from '@/store/useStore';
import { useHydratedValue } from '@/hooks/useHydration';
import AccountDropdown from '@/components/header/AccountDropdown';

const Header = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  // Use Zustand for wishlist and UI state
  const wishlistItemsFromStore = useWishlistStore((state) => state.items.length);
  const wishlistItems = useHydratedValue(wishlistItemsFromStore, 0);
  const { 
    isMobileMenuOpen, 
    isSearchOpen, 
    toggleMobileMenu, 
    toggleSearch 
  } = useUIStore();
  
  // Fetch cart count from server (more reliable than client-side store)
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartItemsCount(0);
        return;
      }
      
      try {
        const response = await fetch('/api/cart');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCartItemsCount(result.data.itemCount || 0);
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartItemsCount(0);
      }
    };
    
    fetchCartCount();
  }, [user]);


  return (
    <header className="minimal-header">
      <div className="minimal-container">
        <nav className="minimal-nav">
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image
              src="/images/avnera-logo.png"
              alt="Avnera"
              width={150}
              height={60}
              style={{ 
                height: '50px', 
                width: 'auto', 
                maxWidth: '200px',
                objectFit: 'contain'
              }}
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'block';
              }}
            />
            <span className="brand-logo" style={{ display: 'none' }}>AVNERA</span>
          </Link>

          {/* Navigation - Desktop */}
          <ul className="minimal-nav-links">
            <li><Link href="/products" className="minimal-nav-link">Shop</Link></li>
            <li><Link href="/products?featured=true" className="minimal-nav-link">New In</Link></li>
            <li><Link href="/products?bestsellers=true" className="minimal-nav-link">Best Sellers</Link></li>
            <li><Link href="/about" className="minimal-nav-link">About</Link></li>
            <li><Link href="/contact" className="minimal-nav-link">Contact</Link></li>
          </ul>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Search */}
            <button
              onClick={toggleSearch}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', position: 'relative' }}
              title="Search Products"
              aria-label="Open search"
            >
              <Search size={20} color="#000" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" style={{ position: 'relative', padding: '8px' }} title="Wishlist">
              <Heart size={20} color="#000" />
              {wishlistItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: '#000',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlistItems}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" style={{ position: 'relative', padding: '8px' }} title="Shopping Cart">
              <ShoppingBag size={20} color="#000" />
              {cartItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: '#000',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Notifications (for logged in users) */}
            {user && (
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', position: 'relative' }}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell size={20} color="#000" />
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#ff4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} />
              </button>
            )}

            {/* Auth Buttons or User Menu */}
            {user ? (
              /* Logged in - Show Account Dropdown */
              <AccountDropdown />
            ) : (
              /* Not logged in - Show Login/Register buttons */
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link 
                  href="/auth/signin" 
                  style={{ 
                    padding: '8px 16px', 
                    color: '#000', 
                    textDecoration: 'none', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.borderColor = '#d1d1d1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.borderColor = '#e5e5e5';
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  style={{ 
                    padding: '8px 16px', 
                    color: '#fff', 
                    textDecoration: 'none', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    backgroundColor: '#FFD700',
                    border: '1px solid #FFD700',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E6C200';
                    e.currentTarget.style.borderColor = '#E6C200';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFD700';
                    e.currentTarget.style.borderColor = '#FFD700';
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              title={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? <X size={20} color="#000" /> : <Menu size={20} color="#000" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Search Bar - Expandable */}
      {isSearchOpen && (
        <div style={{ borderTop: '1px solid #e5e5e5', background: '#fff', padding: '20px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 50px',
                  border: '2px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                autoFocus
              />
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={20} />
              <button
                onClick={toggleSearch}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                title="Close search"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
            {/* Quick Search Suggestions */}
            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>Popular:</span>
              {['Sarees', 'Kurtis', 'Lehengas', 'Ethnic Wear', 'Designer'].map((term) => (
                <button
                  key={term}
                  style={{
                    padding: '4px 12px',
                    background: '#f5f5f5',
                    border: '1px solid #e5e5e5',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#666',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title={`Search for ${term}`}
                  aria-label={`Search for ${term}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFD700';
                    e.currentTarget.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid #e5e5e5', background: '#fff', padding: '20px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href="/products" className="minimal-nav-link" onClick={toggleMobileMenu}>
                Shop
              </Link>
              <Link href="/products?featured=true" className="minimal-nav-link" onClick={toggleMobileMenu}>
                New In
              </Link>
              <Link href="/products?bestsellers=true" className="minimal-nav-link" onClick={toggleMobileMenu}>
                Best Sellers
              </Link>
              <Link href="/about" className="minimal-nav-link" onClick={toggleMobileMenu}>
                About
              </Link>
              <Link href="/contact" className="minimal-nav-link" onClick={toggleMobileMenu}>
                Contact
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '16px', marginTop: '8px' }}>
                {user ? (
                  <>
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '14px', fontWeight: 'bold', color: '#000' }}>
                          {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>{user.fullName || 'User'}</p>
                          <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>{user.emailAddresses[0]?.emailAddress}</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/account/orders" className="minimal-nav-link" onClick={toggleMobileMenu}>
                      My Orders
                    </Link>
                    <button 
                      onClick={async () => {
                        try {
                          await signOut();
                          toggleMobileMenu();
                        } catch (error) {
                          console.error('Mobile logout failed:', error);
                        }
                      }}
                      className="minimal-nav-link text-left w-full hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Sign out of account"
                      aria-label="Sign out of your account"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/signin" 
                      onClick={toggleMobileMenu}
                      style={{ 
                        display: 'block',
                        padding: '12px 16px', 
                        color: '#000', 
                        textDecoration: 'none', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        textAlign: 'center',
                        marginBottom: '8px',
                        backgroundColor: '#fff'
                      }}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/register" 
                      onClick={toggleMobileMenu}
                      style={{ 
                        display: 'block',
                        padding: '12px 16px', 
                        color: '#fff', 
                        textDecoration: 'none', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        backgroundColor: '#FFD700',
                        border: '1px solid #FFD700',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
