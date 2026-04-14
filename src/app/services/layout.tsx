import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Consulting for Small Businesses',
  description: 'Simply Insilico offers AI consulting for small businesses in Raleigh, NC and beyond — AI adoption, workflow automation, and bioinformatics consulting tailored to your needs.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
