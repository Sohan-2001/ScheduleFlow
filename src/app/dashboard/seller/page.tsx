'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { add, format, set } from 'date-fns';
import { PlusCircle, Trash2, Calendar as CalendarIcon, Clock, User, Info, Edit } from 'lucide-react';
import type { Seller, TimeSlot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { doc, getDoc, collection, onSnapshot, writeBatch, Unsubscribe, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [sellerDetails, setSellerDetails] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);

  useEffect(() => {
    if (!user) return;
    
    let unsubscribe: Unsubscribe | undefined;

    const fetchSellerAndAvailability = async () => {
      setLoading(true);
      try {
        const sellerDocRef = doc(db, 'sellers', user.uid);
        const sellerDocSnap = await getDoc(sellerDocRef);

        if (sellerDocSnap.exists()) {
          setSellerDetails({ id: sellerDocSnap.id, ...sellerDocSnap.data() } as Seller);
        } else {
           console.log("No such seller document! Redirecting to onboarding.");
           router.push('/dashboard/seller/onboarding');
           return;
        }
        
        const availabilityCollectionRef = collection(db, 'sellers', user.uid, 'availability');
        unsubscribe = onSnapshot(availabilityCollectionRef, (snapshot) => {
          const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeSlot));
          slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          setAvailability(slots);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching availability:", error);
          toast({ title: "Error", description: "Could not fetch availability.", variant: "destructive" });
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching seller data:", error);
        toast({ title: "Error", description: "Could not fetch seller data.", variant: "destructive" });
        setLoading(false);
      }
    };

    fetchSellerAndAvailability();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, toast, router]);

  const generateSlots = async () => {
    if (!selectedDate || !startTime || !endTime || !user) {
      toast({
        title: 'Error',
        description: 'Please select a date and start/end times.',
        variant: 'destructive',
      });
      return;
    }

    const newSlots: Omit<TimeSlot, 'id'>[] = [];
    const existingStartTimes = new Set(availability.map(slot => new Date(slot.startTime).getTime()));

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

      const newSlot = {
        startTime: currentTime.toISOString(),
        endTime: slotEndTime.toISOString(),
        status: 'available' as const,
      };
      
      if (!existingStartTimes.has(new Date(newSlot.startTime).getTime())) {
          newSlots.push(newSlot);
      }

      currentTime = slotEndTime;
    }
    
    if (newSlots.length === 0) {
      toast({
        title: 'No new slots added.',
        description: `All slots for ${format(selectedDate, 'PPP')} in this time range already exist.`,
      });
      return;
    }

    try {
      const batch = writeBatch(db);
      const availabilityCollectionRef = collection(db, 'sellers', user.uid, 'availability');
      newSlots.forEach(slotData => {
        // Use a consistent and unique ID, e.g., combining user ID and start time
        const slotId = `${slotData.startTime}`;
        const slotDocRef = doc(availabilityCollectionRef, slotId);
        batch.set(slotDocRef, slotData);
      });
      await batch.commit();
      
      toast({
        title: 'Success!',
        description: `${newSlots.length} new slots added for ${format(selectedDate, 'PPP')}.`,
      });
    } catch (error) {
      console.error("Error adding slots:", error);
      toast({ title: "Error", description: "Could not save new slots.", variant: "destructive" });
    }
  };
  
  const removeSlot = async (slotId: string) => {
    if (!user) return;
    try {
      const slotDocRef = doc(db, 'sellers', user.uid, 'availability', slotId);
      await deleteDoc(slotDocRef);

      toast({
        title: 'Slot Removed',
        description: 'The time slot has been removed from your availability.',
      });
    } catch (error) {
      console.error("Error removing slot:", error);
      toast({ title: "Error", description: "Could not remove the slot.", variant: "destructive" });
    }
  };

  const upcomingSlots = availability.filter(slot => new Date(slot.startTime) >= new Date());

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and availability.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>{sellerDetails?.name || 'Your Profile'}</CardTitle>
                <CardDescription>{sellerDetails?.title || 'Your Title'}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/seller/onboarding')}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Profile</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {sellerDetails?.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Availability</CardTitle>
              <CardDescription>Add new time slots for buyers to book.</CardDescription>
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
                <Label>Time Range</Label>
                <div className="flex items-center gap-2">
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  <span>to</span>
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                 <Label>Slot Duration (minutes)</Label>
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
                <ScrollArea className="h-[70vh]">
                  <ul className="space-y-3 pr-4">
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
                            <span className="sr-only">Remove Slot</span>
                          </Button>
                        </div>
                        {slot.status === 'booked' && (
                          <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-semibold flex items-center gap-2 text-primary">
                                  <Info className="h-4 w-4" />
                                  Booking Details
                              </p>
                              {slot.bookedBy && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2 pl-6">
                                    <User className="h-4 w-4" />
                                    Booked by: {slot.bookedBy}
                                </p>
                              )}
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
                </ScrollArea>
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
