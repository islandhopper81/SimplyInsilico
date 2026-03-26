'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const CARDS = [
  {
    label: 'Services',
    heading: 'AI consulting for small businesses',
    body:
      "Most small businesses know AI could help them — they just don't have the time to figure out how. " +
      'We listen to your business and find where AI can remove the busywork or amplify what you already do well.',
    linkLabel: 'Learn more →',
    href: '/services',
  },
  {
    label: 'Products',
    heading: 'Software that simplifies everyday life',
    body:
      'We build practical tools for small businesses and individuals. ' +
      'Our products are designed to solve real problems without getting in the way.',
    linkLabel: 'See our products →',
    href: '/products',
  },
];

export default function WhatWeDoSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          How we can help
        </motion.h2>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CARDS.map((card, index) => (
            <motion.div
              key={card.label}
              className="rounded-2xl border border-border bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-3">
                {card.label}
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {card.heading}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                {card.body}
              </p>
              <Link
                href={card.href}
                className="text-sm font-medium text-primary hover:text-[#1D9E75] transition-colors"
              >
                {card.linkLabel}
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
