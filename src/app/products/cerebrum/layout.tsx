import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cerebrum: LLM-Powered Mutation Testing',
  description:
    'A proof of concept for software engineers who want to know if their tests actually work. Cerebrum runs LLM-powered mutation testing to show which of your tests actually catch bugs.',
};

export default function CerebrumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
