import type { Metadata } from 'next';
import EarlyProductLanding from '@/components/ui/EarlyProductLanding';
import { givingGuru } from '@/data/earlyProducts';

export const metadata: Metadata = {
  title: 'The Giving Guru — Family Gift Coordination',
  description: 'An early look at The Giving Guru: coordinate family gifts, avoid duplicates, and keep surprises intact. Share your interest in this product in development.',
  alternates: { canonical: 'https://www.simplyinsilico.com/products/the-giving-guru' },
};

export default function GivingGuruPage() {
  return <EarlyProductLanding product={givingGuru} />;
}
