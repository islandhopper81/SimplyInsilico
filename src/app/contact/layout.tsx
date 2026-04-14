import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Simply Insilico. Tell us about your business and we\'ll get back to you within one business day. No pitch, no pressure.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
