import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$99 Architecture Assessment',
  description: 'Get a tailored AI architecture recommendation for your business. $99. Delivered within 48 hours.',
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
