'use client';
import { useState, useEffect } from 'react';
import { RecommendationEngine } from '@/components/buyer/recommendation-engine';
import { SellerList } from '@/components/buyer/seller-list';
import type { Seller } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SellerCardSkeleton } from '@/components/buyer/seller-card';

export default function BuyerDashboardPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [recommendedSellerNames, setRecommendedSellerNames] = useState<string[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const sellersCollection = collection(db, 'sellers');
        const sellerSnapshot = await getDocs(sellersCollection);
        const sellerList = sellerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seller));
        setSellers(sellerList);
      } catch (error) {
        console.error("Error fetching sellers:", error);
        // Handle error appropriately, maybe show a toast
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchSellers();
  }, []);

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Find Your Expert</h1>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          Browse our curated list of professionals or use our smart assistant to find the perfect match for your needs.
        </p>
      </div>

      <div className="mb-12">
        <RecommendationEngine
          onRecomendations={setRecommendedSellerNames}
          setIsRecommending={setIsRecommending}
        />
      </div>

      {loadingSellers ? (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Available Professionals</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <SellerCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <SellerList
          sellers={sellers}
          recommendedSellerNames={recommendedSellerNames}
          isRecommending={isRecommending}
        />
      )}
    </div>
  );
}
