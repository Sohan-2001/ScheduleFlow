import { SignIn } from '@/components/auth/sign-in';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <div
          className="flex cursor-pointer items-center gap-3 text-4xl font-bold tracking-tight text-primary md:text-5xl"
        >
          <Sparkles className="h-10 w-10" />
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            ScheduleFlow
          </h1>
        </div>
        <div className="max-w-xl text-lg text-muted-foreground">
          <p>The effortless way to connect professionals with clients.</p>
          <p>Sign in to get started.</p>
        </div>
        <SignIn />
      </div>
    </main>
  );
}
