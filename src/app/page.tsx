import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import WhatWeDoSection from '@/components/sections/WhatWeDoSection';
import CtaSection from '@/components/sections/CtaSection';

export const metadata: Metadata = {
  title: 'AI Consulting & Software Products for Small Businesses',
  description: 'Simply Insilico helps small businesses in Raleigh, NC adopt AI and build practical software tools. AI is moving fast — we help you keep up and get ahead.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
      <CtaSection />
    </>
  );
}
