'use client';
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { add, format, set, formatRelative } from 'date-fns';
import { PlusCircle, Trash2, Calendar as CalendarIcon, Clock, User, Info } from 'lucide-react';
import type { TimeSlot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Simple mock user ID for a seller
const SELLER_ID = 'seller-1';

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const [availability, setAvailability] = useLocalStorage<Record<string, TimeSlot[]>>('schedule-flow-availability', {});
  const sellerAvailability = availability[SELLER_ID] || [];

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);

  const generateSlots = () => {
    if (!selectedDate || !startTime || !endTime) {
      toast({
        title: 'Error',
        description: 'Please select a date and start/end times.',
        variant: 'destructive',
      });
      return;
    }

    const newSlots: TimeSlot[] = [];
    let currentTime = set(selectedDate, {
      hours: parseInt(startTime.split(':')[0]),
      minutes: parseInt(startTime.split(':')[1]),
      seconds: 0,
      milliseconds: 0,
    });
    
    const endDateTime = set(selectedDate, {
      hours: parseInt(endTime.split(':')[0]),
      minutes: parseInt(endTime.split(':')[1]),
    });

    while (currentTime < endDateTime) {
      const slotEndTime = add(currentTime, { minutes: slotDuration });
      if (slotEndTime > endDateTime) break;

      newSlots.push({
        id: `${SELLER_ID}-${currentTime.toISOString()}`,
        startTime: currentTime.toISOString(),
        endTime: slotEndTime.toISOString(),
        status: 'available',
      });
      currentTime = slotEndTime;
    }

    const updatedAvailability = [...sellerAvailability, ...newSlots].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    setAvailability(prev => ({ ...prev, [SELLER_ID]: updatedAvailability }));
    toast({
      title: 'Success!',
      description: `${newSlots.length} slots added for ${format(selectedDate, 'PPP')}.`,
    });
  };
  
  const removeSlot = (slotId: string) => {
    const updatedAvailability = sellerAvailability.filter(slot => slot.id !== slotId);
    setAvailability(prev => ({ ...prev, [SELLER_ID]: updatedAvailability }));
    toast({
      title: 'Slot Removed',
      description: 'The time slot has been removed from your availability.',
    });
  };

  const upcomingSlots = sellerAvailability.filter(slot => new Date(slot.startTime) >= new Date());

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your schedule and availability.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Availability</CardTitle>
              <CardDescription>Select a day and times to add new slots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < new Date(new Date().toDateString())}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <div className="flex items-center gap-2">
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  <span>to</span>
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Slot Duration (minutes)</label>
                 <Input type="number" value={slotDuration} onChange={e => setSlotDuration(parseInt(e.target.value))} min="15" step="15" />
              </div>
              <Button onClick={generateSlots} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate Slots
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Upcoming Slots</CardTitle>
              <CardDescription>Here are your currently available and booked time slots.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSlots.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingSlots.map((slot) => (
                    <li key={slot.id} className={`rounded-lg border p-4 ${slot.status === 'booked' ? 'bg-muted' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(slot.startTime), 'PPP')}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(slot.startTime), 'p')} - {format(new Date(slot.endTime), 'p')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeSlot(slot.id)} disabled={slot.status === 'booked'}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {slot.status === 'booked' && (
                        <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-semibold flex items-center gap-2 text-primary">
                                <Info className="h-4 w-4" />
                                Booking Details
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 pl-6">
                                <User className="h-4 w-4" />
                                Booked by: {slot.bookedBy}
                            </p>
                            {slot.bookedAt && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2 pl-6">
                                    <Clock className="h-4 w-4" />
                                    Booked on: {format(new Date(slot.bookedAt), 'PPP p')}
                                </p>
                            )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-8">You have no upcoming slots. Add some availability to get started!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
