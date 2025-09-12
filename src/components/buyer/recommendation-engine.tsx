'use client';
import { useState } from 'react';
import { getRecommendations } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecommendationEngineProps {
  onRecomendations: (names: string[]) => void;
  setIsRecommending: (isRecommending: boolean) => void;
}

export function RecommendationEngine({ onRecomendations, setIsRecommending }: RecommendationEngineProps) {
  const [needs, setNeeds] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!needs.trim()) {
      toast({
        title: "Can't be empty",
        description: 'Please describe what you are looking for.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setIsRecommending(true);
    try {
      const result = await getRecommendations({ needsDescription: needs });
      onRecomendations(result.recommendations);
      toast({
        title: 'Here are your recommendations!',
        description: `We've highlighted sellers that match your needs.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred',
        description: 'Could not fetch recommendations at this time.',
        variant: 'destructive'
      });
      onRecomendations([]);
    } finally {
      setIsLoading(false);
      setIsRecommending(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-primary" />
          Smart Seller Recommendations
        </CardTitle>
        <CardDescription>
          Describe what you're looking for, and our AI will suggest the best-qualified professionals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., 'I need a financial advisor to help with retirement planning' or 'Looking for a gentle dentist for a routine check-up'"
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Find My Match
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
