'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { add, format, set } from 'date-fns';
import { PlusCircle, Trash2, Calendar as CalendarIcon, Clock, User, Info, Edit, AlertCircle } from 'lucide-react';
import type { Seller, TimeSlot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { doc, getDoc, collection, onSnapshot, writeBatch, Unsubscribe, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const { user, isTokenMissing, signInWithGoogle } = useAuth();
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
  
  const handleConnectCalendar = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error toast is handled in the auth provider
    }
  };

  const upcomingSlots = availability.filter(slot => new Date(slot.startTime) >= new Date());

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8">
       {isTokenMissing && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required: Connect Your Calendar</AlertTitle>
          <AlertDescription>
            Buyers can't book appointments with you until you connect your Google Calendar.
            <Button onClick={handleConnectCalendar} variant="link" className="p-0 h-auto ml-2 text-destructive-foreground underline font-bold">
              Connect now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and availability.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-1">
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
              <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date(new Date().toDateString())}
                  />
              </div>
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
              <Button onClick={generateSlots} className="w-full" disabled={isTokenMissing}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate Slots
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Upcoming Slots</CardTitle>
              <CardDescription>Here are your currently available and booked time slots.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSlots.length > 0 ? (
                <ScrollArea className="h-[70vh] max-h-[70vh]">
                  <ul className="space-y-3 pr-4">
                    {upcomingSlots.map((slot) => (
                      <li key={slot.id} className={`rounded-lg border p-4 ${slot.status === 'booked' ? 'bg-muted' : ''}`}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                          <Button variant="ghost" size="icon" onClick={() => removeSlot(slot.id)} disabled={slot.status === 'booked'} className="self-end sm:self-center">
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
                <div className="text-center py-8 text-muted-foreground">
                  <p>You have no upcoming slots.</p>
                  <p>Add some availability to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
