'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#9FE1CB]/30 via-[#9FE1CB]/10 to-white py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Eyebrow tagline */}
        <motion.p
          className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6 bg-primary/10 px-4 py-1.5 rounded-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Do more with AI
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          AI tools for the businesses that power our communities.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We help small businesses adopt AI, and we build software products that make everyday life simpler.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href="/services"
            className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto bg-primary hover:bg-[#1D9E75] text-white px-8')}
          >
            Our Services
          </Link>
          <Link
            href="/products"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'w-full sm:w-auto border-primary text-primary hover:bg-primary/10 px-8')}
          >
            Our Products
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
