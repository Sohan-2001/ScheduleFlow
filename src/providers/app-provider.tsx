'use client';

import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { TimeSlot } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [availability, setAvailability] = useLocalStorage<Record<string, TimeSlot[]>>('schedule-flow-availability', {});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAvailability = async () => {
      try {
        const sellersCollection = collection(db, 'sellers');
        const sellerSnapshot = await getDocs(sellersCollection);
        const sellerIds = sellerSnapshot.docs.map(doc => doc.id);
        
        const currentAvailability = { ...availability };
        let wasUpdated = false;

        sellerIds.forEach((sellerId) => {
          if (!currentAvailability[sellerId]) {
            currentAvailability[sellerId] = [];
            wasUpdated = true;
          }
        });

        if (wasUpdated) {
          setAvailability(currentAvailability);
        }
      } catch (error) {
        console.error("Failed to initialize availability from sellers", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAvailability();
  }, []); // Run only once on initial client mount


  if (!isInitialized) {
    // Render nothing or a loading spinner until the client-side check is complete
    return null;
  }

  return <>{children}</>;
}
