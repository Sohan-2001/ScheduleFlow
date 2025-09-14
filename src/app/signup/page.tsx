'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
    </main>
  );
}
