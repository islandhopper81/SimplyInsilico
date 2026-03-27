'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { services } from '@/data/services';

const PROCESS_STEPS = [
  {
    number: '01',
    heading: 'We listen',
    body: 'We start by understanding your business — your workflows, your pain points, and your goals. No assumptions, no cookie-cutter solutions.',
  },
  {
    number: '02',
    heading: 'We identify',
    body: "We find where AI can actually help. That might mean automating repetitive tasks — but more importantly, it might mean amplifying your strengths and widening the gap between you and your competition. It also means telling you honestly where AI isn't the right answer.",
  },
  {
    number: '03',
    heading: 'We build',
    body: 'We implement solutions that fit the way you already work — practical, documented, and built for real people, not just developers.',
  },
  {
    number: '04',
    heading: 'We support',
    body: "We don't hand you something and disappear. We make sure it sticks, answer your questions, and help you adapt as things change.",
  },
];

const visibleServices = services.filter((service) => service.isVisible);

export default function ServicesPage() {
  return (
    <main>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#9FE1CB]/30 via-[#9FE1CB]/10 to-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6 bg-primary/10 px-4 py-1.5 rounded-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Services
          </motion.p>
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            How we work
          </motion.h1>
          <motion.p
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We don't just automate the mundane. We help you use AI to amplify what makes your business exceptional.
          </motion.p>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-bold text-primary/20 mb-3">{step.number}</p>
                <h2 className="text-xl font-semibold text-foreground mb-2">{step.heading}</h2>
                <p className="text-muted-foreground leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What we tackle */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            What we tackle
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg mb-12 max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Our roots are in bioinformatics — one of the most data-intensive, AI-adjacent fields there is. That background shapes how we think about every client problem.
          </motion.p>
          <div className="flex flex-col gap-10">
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.name}
                className="border-l-4 border-primary pl-6"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-foreground mb-2">{service.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Hypothetical examples */}
          <motion.div
            className="mt-14 rounded-2xl bg-primary/5 border border-primary/10 p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold tracking-[0.15em] uppercase text-primary mb-5">What this looks like in practice</p>
            <ul className="flex flex-col gap-4">
              {[
                'A contractor automatically follows up with every estimate, answers common questions, and books consultations — so they can stay focused on the work they do best.',
                'A teacher uses an AI agent to give every student personalized feedback on their work. Each student now has their own tutor.',
                'A youth sports organization that used to spend hours sorting teams now lets AI suggest balanced rosters — and keeps friends together.',
                'A dental practice uses AI to follow up with patients who haven\'t scheduled their next cleaning, answer common questions after procedures, and fill cancelled appointments — all without adding staff.',
              ].map((example, index) => (
                <li key={index} className="flex gap-3 text-muted-foreground leading-relaxed">
                  <span className="text-primary mt-1 shrink-0">→</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20 sm:py-28 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to talk?
          </motion.h2>
          <motion.p
            className="text-lg text-white/80 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            No pitch, no pressure — just a conversation about your business and where AI might take it.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link
              href="/contact"
              className={cn(buttonVariants({ size: 'lg' }), 'bg-white text-primary hover:bg-white/90 px-10')}
            >
              Get in touch
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
