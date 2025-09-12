'use client';

import { useEffect, useState } from 'react';
import { sellers as initialSellers } from '@/lib/data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Seller, TimeSlot } from '@/lib/types';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sellers, setSellers] = useLocalStorage<Seller[]>('schedule-flow-sellers', []);
  const [availability, setAvailability] = useLocalStorage<Record<string, TimeSlot[]>>('schedule-flow-availability', {});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs once on the client to initialize data if it's not already there.
    if (sellers.length === 0) {
      setSellers(initialSellers);
    }

    const currentAvailability = { ...availability };
    let wasUpdated = false;
    initialSellers.forEach((seller) => {
      if (!currentAvailability[seller.id]) {
        currentAvailability[seller.id] = [];
        wasUpdated = true;
      }
    });

    if (wasUpdated) {
      setAvailability(currentAvailability);
    }

    setIsInitialized(true);
  }, [sellers, setSellers, availability, setAvailability]);


  if (!isInitialized) {
    // Render nothing or a loading spinner until the client-side check is complete
    return null;
  }

  return <>{children}</>;
}
