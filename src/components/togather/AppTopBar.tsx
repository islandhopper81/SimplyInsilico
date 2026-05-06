'use client';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { useTogetherStore } from '@/lib/togather/store';

export default function AppTopBar() {
  const sessionName = useTogetherStore((state) => state.session?.name);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-white">
      <Link
        href="/products/togather"
        className="text-lg font-bold text-foreground hover:text-primary transition-colors"
      >
        toGather
      </Link>

      <span className="text-sm text-muted-foreground truncate max-w-xs">
        {sessionName ?? ''}
      </span>

      <Link
        href="/products/togather#how-it-works"
        aria-label="Help"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle size={20} />
      </Link>
    </header>
  );
}
