'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PULSE_RING_COUNT = 3;
const PULSE_DURATION_SECONDS = 3;
const PULSE_STAGGER_SECONDS = 0.6;

export default function PulseAccent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="relative h-32 w-32 sm:h-40 sm:w-40">
        {!shouldReduceMotion &&
          Array.from({ length: PULSE_RING_COUNT }).map((_, ringIndex) => (
            <motion.span
              key={ringIndex}
              className="absolute inset-0 rounded-full border border-primary/40"
              initial={{ opacity: 0.6, scale: 0.3 }}
              animate={{ opacity: 0, scale: 1 }}
              transition={{
                duration: PULSE_DURATION_SECONDS,
                repeat: Infinity,
                ease: 'easeOut',
                delay: ringIndex * PULSE_STAGGER_SECONDS,
              }}
            />
          ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-3 w-3 rounded-full bg-primary" />
        </div>

        <span className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-primary/60" />
        <span className="absolute left-[22%] top-[68%] h-1.5 w-1.5 rounded-full bg-primary/60" />
      </div>
    </div>
  );
}
