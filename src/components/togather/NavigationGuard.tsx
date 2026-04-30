'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTogetherStore } from '@/lib/togather/store';

interface NavigationGuardProps {
  require: 'session' | 'participants';
  children: React.ReactNode;
}

export default function NavigationGuard({ require, children }: NavigationGuardProps) {
  const router = useRouter();
  const session = useTogetherStore((state) => state.session);
  const participantCount = useTogetherStore((state) => state.participants.length);

  useEffect(() => {
    if (require === 'session' && session === null) {
      router.replace('/products/togather/app/setup');
    } else if (require === 'participants' && (session === null || participantCount === 0)) {
      const destination =
        session === null
          ? '/products/togather/app/setup'
          : '/products/togather/app/participants';
      router.replace(destination);
    }
  }, [require, session, participantCount, router]);

  const isReady =
    require === 'session'
      ? session !== null
      : session !== null && participantCount > 0;

  if (!isReady) return null;

  return <>{children}</>;
}
