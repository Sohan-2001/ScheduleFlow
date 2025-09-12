'use server';

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
