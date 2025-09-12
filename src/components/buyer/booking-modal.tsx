'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { format } from 'date-fns';
import { CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import type { Seller, TimeSlot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface BookingModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  seller: Seller;
}

export function BookingModal({ isOpen, setIsOpen, seller }: BookingModalProps) {
  const { toast } = useToast();
  const [availability, setAvailability] = useLocalStorage<Record<string, TimeSlot[]>>('schedule-flow-availability', {});
  const sellerAvailability = availability[seller.id] || [];

  const handleBookSlot = (slotId: string) => {
    const updatedAvailability = sellerAvailability.map(slot =>
      slot.id === slotId ? { ...slot, status: 'booked' as const } : slot
    );
    setAvailability(prev => ({ ...prev, [seller.id]: updatedAvailability }));

    const bookedSlot = sellerAvailability.find(s => s.id === slotId);
    if (bookedSlot) {
      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with ${seller.name} on ${format(new Date(bookedSlot.startTime), 'PPP')} at ${format(new Date(bookedSlot.startTime), 'p')} is confirmed.`,
        className: 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600',
      });
    }
    setIsOpen(false);
  };
  
  const availableSlots = sellerAvailability.filter(slot => slot.status === 'available');

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
                  <Button variant="outline" size="sm" onClick={() => handleBookSlot(slot.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
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
