/**
 * Landing Page - Professional controller testing hero
 */

import { memo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';

import { useControllerStore } from '@/state/controllerSlice';
import { usePreferencesStore } from '@/state/preferencesSlice';

// Icons as components for reusability
const LatencyIcon = memo(function LatencyIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
});

const LiveIcon = memo(function LiveIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 18.75h.008v.008H12v-.008z" />
    </svg>
  );
});

const CoverageIcon = memo(function CoverageIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
});

const features = [
  {
    icon: LatencyIcon,
    value: '<16ms',
    label: 'Low Latency',
    sublabel: '60fps polling rate',
  },
  {
    icon: LiveIcon,
    value: 'Live',
    label: 'Real-Time',
    sublabel: 'Instant feedback',
  },
  {
    icon: CoverageIcon,
    value: '100%',
    label: 'Coverage',
    sublabel: 'All inputs tested',
  },
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const LandingPage = memo(function LandingPage() {
  const reducedMotion = usePreferencesStore((state) => state.reducedMotion);
  const { controllers } = useControllerStore(
    useShallow((state) => ({ controllers: state.controllers }))
  );

  const controllerCount = Object.keys(controllers).length;
  const hasController = controllerCount > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      <motion.div
        variants={reducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
        className="flex max-w-3xl flex-col items-center text-center"
      >
        {/* Status Badge */}
        <motion.div variants={reducedMotion ? undefined : itemVariants}>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${
              hasController
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                hasController ? 'bg-emerald-400' : 'bg-violet-400 animate-pulse'
              }`}
            />
            <span
              className={`text-sm ${
                hasController ? 'text-emerald-300' : 'text-white/60'
              }`}
            >
              {hasController
                ? `${controllerCount} Controller${controllerCount > 1 ? 's' : ''} connected`
                : 'Waiting for controller'}
            </span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={reducedMotion ? undefined : itemVariants}
          className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-white/40"
        >
          Professional Controller Testing
        </motion.p>

        {/* Main Heading */}
        <motion.h1
          variants={reducedMotion ? undefined : itemVariants}
          className="mt-4 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Controller Diagnostics
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={reducedMotion ? undefined : itemVariants}
          className="mt-6 max-w-xl text-lg text-white/50"
        >
          Real-time input analysis with millisecond precision.{' '}
          <span className="text-white/70">
            Detect drift, measure latency, test every input.
          </span>
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={reducedMotion ? undefined : itemVariants} className="mt-10">
          <Link
            to="/live"
            className="group inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/25"
          >
            Start Testing
            <motion.span
              animate={reducedMotion ? undefined : { x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={reducedMotion ? undefined : itemVariants}
          className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {features.map((feature) => (
            <div
              key={feature.label}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left"
            >
              <div className="mb-4 inline-flex rounded-xl bg-violet-500/20 p-3 text-violet-400">
                <feature.icon />
              </div>
              <p className="text-3xl font-bold text-white">{feature.value}</p>
              <p className="mt-1 font-medium text-white/80">{feature.label}</p>
              <p className="text-sm text-white/40">{feature.sublabel}</p>
            </div>
          ))}
        </motion.div>

        {/* Hint Text */}
        <motion.p
          variants={reducedMotion ? undefined : itemVariants}
          className="mt-16 text-sm text-white/30"
        >
          Press any button on your controller to begin
        </motion.p>
      </motion.div>

      {/* Help Button */}
      <button
        className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
        aria-label="Help"
      >
        ?
      </button>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';
