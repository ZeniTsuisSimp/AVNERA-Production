import { useState, useEffect } from 'react';

/**
 * Hook to prevent hydration mismatches by ensuring certain values
 * are only rendered after client-side hydration is complete
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook to safely use persisted store values after hydration
 * Returns fallback value on server and before hydration, actual value after
 */
export function useHydratedValue<T>(value: T, fallback: T): T {
  const isHydrated = useHydration();
  return isHydrated ? value : fallback;
}
