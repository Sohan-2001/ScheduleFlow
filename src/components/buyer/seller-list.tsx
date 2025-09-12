'use client';
import { SellerCard, SellerCardSkeleton } from '@/components/buyer/seller-card';
import type { Seller } from '@/lib/types';

interface SellerListProps {
  sellers: Seller[];
  recommendedSellerNames: string[];
  isRecommending: boolean;
}

export function SellerList({ sellers, recommendedSellerNames, isRecommending }: SellerListProps) {
  if (isRecommending) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Available Professionals</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SellerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Available Professionals</h2>
      {sellers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sellers.map((seller) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              isRecommended={recommendedSellerNames.includes(seller.name)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No sellers available at the moment.</p>
      )}
    </div>
  );
}
