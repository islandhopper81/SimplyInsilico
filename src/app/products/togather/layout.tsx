import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'toGather — Smart Team Formation for Leagues and Organizers',
  description:
    'toGather helps league administrators divide rosters into balanced groups — keeping friends together, guaranteeing every team has a coach, and exporting results in seconds. No account required.',
};

export default function TogatherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
