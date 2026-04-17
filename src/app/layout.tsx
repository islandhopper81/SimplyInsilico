import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Simply Insilico | AI Consulting & Software for Small Businesses',
    template: '%s | Simply Insilico',
  },
  description: 'Simply Insilico is a Raleigh, NC AI consulting firm helping small businesses adopt AI — from identifying opportunities to hands-on implementation. We also build practical software products for individuals and small businesses.',
  icons: {
    icon: '/logo-favicon.svg',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Simply Insilico LLC',
  description: 'AI consulting and software products for small businesses. We help small businesses in Raleigh, NC and beyond adopt AI and get ahead.',
  url: 'https://www.simplyinsilico.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Raleigh',
    addressRegion: 'NC',
    addressCountry: 'US',
  },
  areaServed: 'United States',
  serviceType: ['AI Consulting', 'AI Adoption', 'Bioinformatics Consulting', 'Software Products'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
        />
      </body>
    </html>
  );
}
