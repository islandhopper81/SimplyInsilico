'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PULSE_RING_COUNT = 2;
const PULSE_DURATION_SECONDS = 2.2;
const PULSE_STAGGER_SECONDS = 0.8;
const PULSE_MAX_SCALE = 1.3;

type Orbit = {
  diameterPercent: number;
  rotationDurationSeconds: number;
  direction: 1 | -1;
  dotSizeClass: string;
};

const ORBITS: Orbit[] = [
  { diameterPercent: 62, rotationDurationSeconds: 7, direction: 1, dotSizeClass: 'h-2 w-2' },
  { diameterPercent: 92, rotationDurationSeconds: 11, direction: -1, dotSizeClass: 'h-2.5 w-2.5' },
];

export default function PulseAccent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="relative h-44 w-44 sm:h-52 sm:w-52">
        {!shouldReduceMotion &&
          Array.from({ length: PULSE_RING_COUNT }).map((_, ringIndex) => (
            <motion.span
              key={ringIndex}
              className="absolute inset-0 rounded-full border-2 border-primary/60"
              initial={{ opacity: 0.8, scale: 0.3 }}
              animate={{ opacity: 0, scale: PULSE_MAX_SCALE }}
              transition={{
                duration: PULSE_DURATION_SECONDS,
                repeat: Infinity,
                ease: 'easeOut',
                delay: ringIndex * PULSE_STAGGER_SECONDS,
              }}
            />
          ))}

        {ORBITS.map((orbit, orbitIndex) => (
          <div
            key={orbitIndex}
            className="absolute left-1/2 top-1/2 rounded-full border border-primary/25"
            style={{
              width: `${orbit.diameterPercent}%`,
              height: `${orbit.diameterPercent}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={shouldReduceMotion ? undefined : { rotate: 360 * orbit.direction }}
              transition={{
                duration: orbit.rotationDurationSeconds,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <span
                className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${orbit.dotSizeClass}`}
              />
            </motion.div>
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_12px_rgba(16,122,89,0.5)]" />
        </div>
      </div>
    </div>
  );
}
