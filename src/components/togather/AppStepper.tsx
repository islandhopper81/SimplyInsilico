'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { useTogetherStore } from '@/lib/togather/store';

const STEPS = [
  { number: 1, label: 'Setup', href: '/products/togather/app/setup' },
  { number: 2, label: 'Participants', href: '/products/togather/app/participants' },
  { number: 3, label: 'Groups', href: '/products/togather/app/groups' },
] as const;

export default function AppStepper() {
  const pathname = usePathname();
  const session = useTogetherStore((state) => state.session);
  const participantCount = useTogetherStore((state) => state.participants.length);

  function isAccessible(stepNumber: number): boolean {
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return session !== null;
    if (stepNumber === 3) return session !== null && participantCount > 0;
    return false;
  }

  function isCurrent(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function isCompleted(stepNumber: number, href: string): boolean {
    return isAccessible(stepNumber) && !isCurrent(href);
  }

  return (
    <nav aria-label="Progress" className="flex items-center justify-center gap-0 px-6 py-3 bg-muted/40 border-b border-border">
      {STEPS.map((step, index) => {
        const current = isCurrent(step.href);
        const completed = isCompleted(step.number, step.href);
        const accessible = isAccessible(step.number);

        const indicator = completed ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
            <Check size={12} strokeWidth={3} />
          </span>
        ) : (
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold
              ${current
                ? 'border-primary bg-primary text-white'
                : 'border-muted-foreground/40 text-muted-foreground'
              }`}
          >
            {step.number}
          </span>
        );

        const label = (
          <span
            className={`ml-2 text-sm font-medium
              ${current ? 'text-primary' : completed ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {step.label}
          </span>
        );

        return (
          <div key={step.href} className="flex items-center">
            {accessible && !current ? (
              <Link href={step.href} className="flex items-center group" aria-current={current ? 'step' : undefined}>
                {indicator}
                {label}
              </Link>
            ) : (
              <div
                className="flex items-center"
                aria-current={current ? 'step' : undefined}
                aria-disabled={!accessible}
              >
                {indicator}
                {label}
              </div>
            )}

            {index < STEPS.length - 1 && (
              <div className="mx-4 h-px w-12 bg-border" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
