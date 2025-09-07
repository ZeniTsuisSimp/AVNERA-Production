import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
    [key: string]: string | number | boolean | undefined;
  };
  maxQuantity?: number;
}

// Wishlist item interface
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
  inStock: boolean;
  rating?: number;
}

// Cart store interface
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, variant?: CartItem['variant']) => void;
  updateQuantity: (id: string, quantity: number, variant?: CartItem['variant']) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// Wishlist store interface
interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

// UI store interface
interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  currentCurrency: string;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openMobileMenu: () => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  openSearch: () => void;
  setCurrency: (currency: string) => void;
}

// Cart store
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (i) => i.id === item.id && 
          JSON.stringify(i.variant) === JSON.stringify(item.variant)
        );

        if (existingItemIndex > -1) {
          const existingItem = items[existingItemIndex];
          const newQuantity = existingItem.quantity + 1;
          const maxQuantity = item.maxQuantity || 10;
          
          if (newQuantity <= maxQuantity) {
            set({
              items: items.map((i, index) =>
                index === existingItemIndex
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            });
          }
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },

      removeItem: (id, variant) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && 
            JSON.stringify(item.variant) === JSON.stringify(variant))
          ),
        });
      },

      updateQuantity: (id, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(id, variant);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id && JSON.stringify(item.variant) === JSON.stringify(variant)
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Wishlist store
export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);
        
        if (!existingItem) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },

      clearWishlist: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

// UI store (not persisted)
export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  currentCurrency: 'INR',

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),

  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),

  setCurrency: (currency) => set({ currentCurrency: currency }),
}));
