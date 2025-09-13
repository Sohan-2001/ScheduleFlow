'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { format } from 'date-fns';
import { CalendarCheck, Clock, CheckCircle, Loader2 } from 'lucide-react';
import type { Seller, TimeSlot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/providers/auth-provider';
import { scheduleEvent } from '@/app/actions';
import { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  seller: Seller;
}

export function BookingModal({ isOpen, setIsOpen, seller }: BookingModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [availability, setAvailability] = useLocalStorage<Record<string, TimeSlot[]>>('schedule-flow-availability', {});
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const sellerAvailability = availability[seller.id] || [];

  const handleBookSlot = async (slot: TimeSlot) => {
    if (!user || !user.email) {
      toast({ title: 'Error', description: 'You must be logged in to book.', variant: 'destructive' });
      return;
    }

    setBookingSlotId(slot.id);

    try {
      // Step 1: Create the Google Calendar event
      const result = await scheduleEvent({
        sellerId: seller.id,
        buyerEmail: user.email,
        slot: {
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create calendar event.');
      }

      // Step 2: Update the local state to reflect the booking
      const updatedAvailability = sellerAvailability.map(s =>
        s.id === slot.id ? {
          ...s,
          status: 'booked' as const,
          bookedBy: user.email,
          bookedAt: new Date().toISOString(),
        } : s
      );
      setAvailability(prev => ({ ...prev, [seller.id]: updatedAvailability }));

      // Step 3: Notify the user
      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with ${seller.name} is confirmed. An event has been added to your Google Calendar.`,
        className: 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600',
      });

      setIsOpen(false);

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Could not book the appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBookingSlotId(null);
    }
  };

  const availableSlots = sellerAvailability.filter(slot => slot.status === 'available');
  const isBooking = bookingSlotId !== null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
          <DialogDescription>
            Select an available time slot with {seller.name}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            {availableSlots.length > 0 ? (
            <div className="space-y-2 py-4">
              {availableSlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-secondary">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(slot.startTime), 'eeee, MMM d')}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(slot.startTime), 'p')} - {format(new Date(slot.endTime), 'p')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookSlot(slot)}
                    disabled={!user || isBooking}
                  >
                    {bookingSlotId === slot.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Book
                  </Button>
                </div>
              ))}
            </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
                    <CalendarCheck className="h-12 w-12 mb-4" />
                    <p className="font-semibold">No available slots</p>
                    <p className="text-sm">{seller.name} doesn't have any open appointments right now.</p>
                </div>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
