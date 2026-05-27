import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '$99 Architecture Assessment',
  description: 'Get a tailored AI architecture recommendation for your business. $99. Delivered within 48 hours.',
};

const WHAT_YOU_GET = [
  {
    heading: 'A tailored recommendation',
    body: 'Not a generic checklist — a plain-English architecture plan written specifically for your business, your data, and your team.',
  },
  {
    heading: 'No jargon',
    body: 'We explain what to build and why in language you can actually act on, whether you hire a developer or hand it to us.',
  },
  {
    heading: '48-hour turnaround',
    body: 'Answer the interview today. Receive your recommendation within two business days.',
  },
];

export default function AssessmentPage() {
  return (
    <main>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#9FE1CB]/30 via-[#9FE1CB]/10 to-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6 bg-primary/10 px-4 py-1.5 rounded-full">
            Architecture Assessment
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Find out exactly what to build — before you spend a dollar on development
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A short AI-powered interview. A plain-English recommendation tailored to your business.
            $99. Delivered within 48 hours.
          </p>
          <div className="mt-10">
            <Link
              href="/assessment/interview"
              className="inline-block rounded-lg bg-primary text-white font-medium px-10 py-4 text-base hover:bg-[#1D9E75] transition-colors"
            >
              Start your assessment →
            </Link>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
            What you get
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {WHAT_YOU_GET.map((item, index) => (
              <div key={index} className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.heading}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to find out what to build?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
            The interview takes about 10 minutes. Your recommendation arrives within 48 hours.
          </p>
          <Link
            href="/assessment/interview"
            className="inline-block rounded-lg bg-white text-primary font-medium px-10 py-4 text-base hover:bg-white/90 transition-colors"
          >
            Start your assessment →
          </Link>
        </div>
      </section>

    </main>
  );
}
