'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Sliders, Lock } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const APP_SETUP_URL = '/products/togather/app/setup';

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    heading: 'Enter your roster',
    body: 'Add participants manually or import from a CSV. Mark who is willing to coach, note friend preferences, and link coach volunteers to their kids in the roster.',
  },
  {
    number: '02',
    heading: 'Run the algorithm',
    body: 'A two-phase algorithm maximizes friend co-placement and guarantees every group has a head coach. If there are not enough coaches, you are warned before any assignments are written.',
  },
  {
    number: '03',
    heading: 'Adjust and export',
    body: 'Fine-tune the result by dragging participants between groups in a Trello-style board or an interactive graph. Export to CSV for TeamSnap or GameChanger, or save the full session as JSON.',
  },
];

const FEATURES = [
  {
    icon: Users,
    heading: 'Friendship-aware grouping',
    body: 'Participants connected by friend preferences are pulled toward the same group. The algorithm maximizes co-placement while keeping group sizes balanced.',
  },
  {
    icon: ShieldCheck,
    heading: 'Coach assignment guaranteed',
    body: 'Every group gets a head coach. If there are not enough volunteers to cover all groups, you are warned before any assignments are applied — not surprised after.',
  },
  {
    icon: Sliders,
    heading: 'Drag-and-drop fine-tuning',
    body: 'Move participants between groups in a Trello-style board or an interactive graph. Friend satisfaction and coach coverage update live with every change.',
  },
  {
    icon: Lock,
    heading: 'No account required',
    body: 'Open the tool, enter your data, and get groups. Nothing to sign up for. Export your session as JSON to pick up where you left off in a future session.',
  },
];

export default function TogatherLandingPage() {
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
            Team formation tool
          </motion.p>
          <motion.h1
            className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Togather
          </motion.h1>
          <motion.p
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Friendship-aware group formation for leagues, coaches, and organizers.
            Keep friends together, guarantee every team has a coach, and export the result in seconds.
          </motion.p>
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href={APP_SETUP_URL}
              className={cn(buttonVariants({ size: 'lg' }), 'px-10')}
            >
              Launch Tool →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Team formation should not take an afternoon
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Every season, league administrators and coaches face the same problem: dozens of
            players to sort into balanced teams, parents requesting that their kids stay with
            friends, and a handful of volunteers willing to coach — but no easy way to satisfy
            all three at once. Spreadsheets break down fast. Manual sorting takes hours and
            still produces complaints.
          </motion.p>
          <motion.p
            className="mt-4 text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Togather solves it in minutes.
          </motion.p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How it works
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-bold text-primary/20 mb-3">{step.number}</p>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.heading}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Everything you need, nothing you do not
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.heading}
                  className="flex gap-5"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{feature.heading}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="rounded-2xl bg-primary/5 border border-primary/10 p-10 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold tracking-[0.15em] uppercase text-primary mb-4">
              Privacy first
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Your data never leaves your browser.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No account. No database. No server ever sees your roster. Everything runs
              locally — when the session ends, the data is gone. Export your session as JSON
              to restore it next time.
            </p>
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
            Ready to form some teams?
          </motion.h2>
          <motion.p
            className="text-lg text-white/80 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            No sign-up, no installation. Open the tool, enter your roster, and get balanced
            groups in minutes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link
              href={APP_SETUP_URL}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-white text-primary hover:bg-white/90 px-10',
              )}
            >
              Launch Tool →
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
