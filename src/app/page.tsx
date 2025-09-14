import { SignIn } from '@/components/auth/sign-in';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://sxldi6vsg8pc7vjq.public.blob.vercel-storage.com/Gemini_Generated_Image_dth0jjdth0jjdth0.png')",
        }}
      />
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center gap-6 rounded-xl bg-card/80 p-8 shadow-2xl">
        <div className="flex cursor-pointer items-center gap-3 text-4xl font-bold tracking-tight text-primary md:text-5xl">
          <Sparkles className="h-10 w-10" />
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            ScheduleFlow
          </h1>
        </div>
        <div className="max-w-xl text-lg text-card-foreground">
          <p>The effortless way to connect professionals with clients.</p>
          <p>Sign in to get started.</p>
        </div>
        <SignIn />
      </div>
    </main>
  );
}
