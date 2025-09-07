import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Cart Item Type
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  options?: { [key: string]: string }; // color, size, etc.
  sku: string;
  inStock: boolean;
}

// Wishlist Item Type
interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  slug: string;
}

// Cart Store
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => 
              item.productId === newItem.productId && 
              item.variantId === newItem.variantId
          );
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return {
              items: [...state.items, { ...newItem, quantity: 1 }],
            };
          }
        }),
        
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
        
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => item.id !== itemId)
            : state.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
              ),
        })),
        
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'anvera-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Wishlist Store
interface WishlistStore {
  items: WishlistItem[];
  isOpen: boolean;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (newItem) =>
        set((state) => {
          const exists = state.items.some((item) => item.productId === newItem.productId);
          if (!exists) {
            return { items: [...state.items, newItem] };
          }
          return state;
        }),
        
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
        
      toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),
      
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'anvera-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// UI Store
interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  currentCurrency: string;
  currentCountry: string;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  setCurrency: (currency: string) => void;
  setCountry: (country: string) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  currentCurrency: 'INR',
  currentCountry: 'IN',
  
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    
  toggleSearch: () =>
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),
    
  setCurrency: (currency) => set({ currentCurrency: currency }),
  
  setCountry: (country) => set({ currentCountry: country }),
}));
