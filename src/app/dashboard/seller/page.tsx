'use client';
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { add, format, set, formatRelative } from 'date-fns';
import { PlusCircle, Trash2, Calendar as CalendarIcon, Clock, User, Info, Briefcase, FileText, UserCircle } from 'lucide-react';
import type { Seller, TimeSlot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { sellers } from '@/lib/data';

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [availability, setAvailability] = useLocalStorage<Record<string, TimeSlot[]>>('schedule-flow-availability', {});
  
  // Find the seller details that match the logged-in user's ID
  const sellerDetails = sellers.find(s => s.id === user?.uid);
  const sellerId = sellerDetails?.id || user?.uid;
  const sellerAvailability = sellerId ? availability[sellerId] || [] : [];
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);

  const generateSlots = () => {
    if (!selectedDate || !startTime || !endTime || !sellerId) {
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
        id: `${sellerId}-${currentTime.toISOString()}`,
        startTime: currentTime.toISOString(),
        endTime: slotEndTime.toISOString(),
        status: 'available',
      });
      currentTime = slotEndTime;
    }

    const updatedAvailability = [...sellerAvailability, ...newSlots].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    setAvailability(prev => ({ ...prev, [sellerId]: updatedAvailability }));
    toast({
      title: 'Success!',
      description: `${newSlots.length} slots added for ${format(selectedDate, 'PPP')}.`,
    });
  };
  
  const removeSlot = (slotId: string) => {
    if (!sellerId) return;
    const updatedAvailability = sellerAvailability.filter(slot => slot.id !== slotId);
    setAvailability(prev => ({ ...prev, [sellerId]: updatedAvailability }));
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

      {sellerDetails && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>This is how buyers see you on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <UserCircle className="h-6 w-6 text-muted-foreground" />
                <p><span className="font-semibold">Name:</span> {sellerDetails.name}</p>
            </div>
            <div className="flex items-center gap-4">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
                <p><span className="font-semibold">Title:</span> {sellerDetails.title}</p>
            </div>
            <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <div>
                    <p className="font-semibold">Description:</p>
                    <p className="text-muted-foreground">{sellerDetails.description}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

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
