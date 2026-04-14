import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software Products for Small Businesses',
  description: 'Practical AI-powered software tools built by Simply Insilico for individuals and small businesses. Designed to solve real problems without getting in the way.',
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
