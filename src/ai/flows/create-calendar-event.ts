'use server';
/**
 * @fileOverview Creates a Google Calendar event for a booked appointment.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const CreateCalendarEventInputSchema = z.object({
  sellerId: z.string().describe('The ID of the seller.'),
  buyerEmail: z.string().email().describe("The buyer's email address."),
  slot: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  }),
});

export type CreateCalendarEventInput = z.infer<
  typeof CreateCalendarEventInputSchema
>;

async function getAccessToken(userId: string): Promise<string> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists() || !userDoc.data()?.accessToken) {
    throw new Error(`Access token not found for user ${userId}`);
  }
  return userDoc.data()?.accessToken;
}

const createCalendarEventFlow = ai.defineFlow(
  {
    name: 'createCalendarEventFlow',
    inputSchema: CreateCalendarEventInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const { sellerId, buyerEmail, slot } = input;

    // We need the seller's access token to create an event on their calendar.
    const sellerAccessToken = await getAccessToken(sellerId);

    const event = {
      summary: 'Appointment Booking',
      description: `Appointment with ${buyerEmail}.`,
      start: {
        dateTime: slot.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: slot.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: [{ email: buyerEmail }],
      reminders: {
        useDefault: true,
      },
      conferenceData: {
        createRequest: {
          requestId: `booking-${sellerId}-${slot.startTime}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sellerAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create calendar event:', errorData);
      throw new Error(
        `Google Calendar API failed: ${errorData.error.message}`
      );
    }

    const responseData = await response.json();
    console.log('Event created:', responseData.htmlLink);
  }
);

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<void> {
    return await createCalendarEventFlow(input);
}
