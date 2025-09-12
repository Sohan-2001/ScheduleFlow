'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ShoppingCart, Sparkles } from 'lucide-react';
import type { User } from '@/lib/types';

interface RoleSelectionProps {
  setUser: (user: User) => void;
}

export function RoleSelection({ setUser }: RoleSelectionProps) {
  const handleSelectRole = (role: 'buyer' | 'seller') => {
    setUser({ role });
  };

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <h1 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-primary md:text-5xl">
          <Sparkles className="h-10 w-10" />
          Welcome to ScheduleFlow
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          The smartest way to connect and schedule. Are you here to offer your services or to book an appointment?
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
            <Button size="lg" className="w-full" onClick={() => handleSelectRole('seller')}>
              Get Started as a Seller
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
            <Button size="lg" className="w-full" variant="outline" onClick={() => handleSelectRole('buyer')}>
              Get Started as a Buyer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
