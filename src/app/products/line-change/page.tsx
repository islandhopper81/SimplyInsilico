import type { Metadata } from 'next';
import EarlyProductLanding from '@/components/ui/EarlyProductLanding';
import { lineChange } from '@/data/earlyProducts';

export const metadata: Metadata = {
  title: 'Line Change — Fair Playing Time for Youth Sports',
  description: 'An early look at Line Change: an offline-friendly tool for youth sports coaches to track substitutions and fair playing time. Share your interest.',
  alternates: { canonical: 'https://www.simplyinsilico.com/products/line-change' },
};

export default function LineChangePage() {
  return <EarlyProductLanding product={lineChange} />;
}
