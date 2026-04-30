'use client';

import { useRouter } from 'next/navigation';
import SessionSetupForm from '@/components/togather/SessionSetupForm';
import { useTogetherStore } from '@/lib/togather/store';
import type { Session, SessionState } from '@/lib/togather/types';

export default function SetupPage() {
  const router = useRouter();
  const initSession = useTogetherStore((state) => state.initSession);
  const importSession = useTogetherStore((state) => state.importSession);

  function handleSubmit(setup: Session) {
    initSession(setup);
    router.push('/products/togather/app/participants');
  }

  function handleImport(session: SessionState) {
    importSession(session);
    router.push('/products/togather/app/groups');
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <SessionSetupForm onSubmit={handleSubmit} onImport={handleImport} />
    </div>
  );
}
