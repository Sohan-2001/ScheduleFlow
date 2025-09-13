'use server';

import {
  createCalendarEvent,
  type CreateCalendarEventInput,
} from '@/ai/flows/create-calendar-event';
import {
  recommendSellers,
  type RecommendSellersInput,
  type RecommendSellersOutput,
} from '@/ai/flows/seller-recommendation';

export async function getRecommendations(
  input: RecommendSellersInput
): Promise<RecommendSellersOutput> {
  try {
    const recommendations = await recommendSellers(input);
    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // In a real app, you'd want more robust error handling and logging.
    return { recommendations: [] };
  }
}

export async function scheduleEvent(
  input: CreateCalendarEventInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await createCalendarEvent(input);
    return { success: true };
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
