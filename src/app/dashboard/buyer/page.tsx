'use client';
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { RecommendationEngine } from '@/components/buyer/recommendation-engine';
import { SellerList } from '@/components/buyer/seller-list';
import type { Seller } from '@/lib/types';

export default function BuyerDashboardPage() {
  const [sellers] = useLocalStorage<Seller[]>('schedule-flow-sellers', []);
  const [recommendedSellerNames, setRecommendedSellerNames] = useState<string[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);

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

      <SellerList
        sellers={sellers}
        recommendedSellerNames={recommendedSellerNames}
        isRecommending={isRecommending}
      />
    </div>
  );
}
