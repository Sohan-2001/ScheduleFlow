'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ShoppingCart, Sparkles } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'buyer' | 'seller') => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <h1 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-primary md:text-5xl">
          <Sparkles className="h-10 w-10" />
          One Last Step!
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          To personalize your experience, please tell us how you'll be using ScheduleFlow.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="transform-gpu transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Briefcase className="h-12 w-12" />
              </div>
              I'm a Seller
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              Offer your services, manage your schedule, and connect with clients.
            </p>
            <Button size="lg" className="w-full" onClick={() => onSelectRole('seller')}>
              Continue as a Seller
            </Button>
          </CardContent>
        </Card>
        <Card className="transform-gpu transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-accent/10 p-4 text-accent">
                <ShoppingCart className="h-12 w-12" />
              </div>
              I'm a Buyer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              Find and book appointments with top professionals and services.
            </p>
            <Button size="lg" className="w-full" variant="outline" onClick={() => onSelectRole('buyer')}>
              Continue as a Buyer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
