'use client';

import { motion, useReducedMotion } from 'framer-motion';

const GLOW_RING_COUNT = 2;
const GLOW_DURATION_SECONDS = 2.8;
const GLOW_STAGGER_SECONDS = 1;

const ACCENT_DOTS = [
  { top: '22%', left: '16%', sizeClass: 'h-2 w-2', delaySeconds: 0 },
  { top: '70%', left: '20%', sizeClass: 'h-1.5 w-1.5', delaySeconds: 0.7 },
];

export default function PulseAccent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="relative h-32 w-32 sm:h-40 sm:w-40">
        {!shouldReduceMotion &&
          Array.from({ length: GLOW_RING_COUNT }).map((_, ringIndex) => (
            <motion.span
              key={ringIndex}
              className="absolute inset-0 rounded-full bg-primary/25 blur-md"
              initial={{ opacity: 0.45, scale: 0.4 }}
              animate={{ opacity: 0, scale: 1.1 }}
              transition={{
                duration: GLOW_DURATION_SECONDS,
                repeat: Infinity,
                ease: 'easeOut',
                delay: ringIndex * GLOW_STAGGER_SECONDS,
              }}
            />
          ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_rgba(16,122,89,0.45)]" />
        </div>

        {ACCENT_DOTS.map((dot, dotIndex) =>
          shouldReduceMotion ? (
            <span
              key={dotIndex}
              className={`absolute rounded-full bg-primary/60 ${dot.sizeClass}`}
              style={{ top: dot.top, left: dot.left }}
            />
          ) : (
            <motion.span
              key={dotIndex}
              className={`absolute rounded-full bg-primary/60 ${dot.sizeClass}`}
              style={{ top: dot.top, left: dot.left }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: dot.delaySeconds,
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
