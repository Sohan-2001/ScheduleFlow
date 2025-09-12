'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Star } from 'lucide-react';
import type { Seller } from '@/lib/types';
import { BookingModal } from './booking-modal';

interface SellerCardProps {
  seller: Seller;
  isRecommended: boolean;
}

export function SellerCard({ seller, isRecommended }: SellerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          <Image
            src={seller.image}
            alt={`Portrait of ${seller.name}`}
            width={400}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="person portrait"
          />
          {isRecommended && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground border-transparent">
              <Star className="mr-1 h-3 w-3" />
              Recommended
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <CardTitle className="text-lg">{seller.name}</CardTitle>
          <CardDescription className="font-medium text-primary">{seller.title}</CardDescription>
          <p className="mt-2 text-sm text-muted-foreground">{seller.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={() => setIsModalOpen(true)}>
            View Availability
          </Button>
        </CardFooter>
      </Card>
      <BookingModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        seller={seller}
      />
    </>
  );
}

export function SellerCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="flex-1 p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full mt-2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
