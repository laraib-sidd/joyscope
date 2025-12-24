/**
 * UnsupportedBanner - Browser compatibility warning banner
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { getBrowserCompatibility, type BrowserCompatibility } from '@/services/gamepadService';

export const UnsupportedBanner = memo(function UnsupportedBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const compat = getBrowserCompatibility();

  // Don't show if everything is supported or user dismissed
  if (compat.isSupported && compat.warnings.length === 0) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  const isBlocking = !compat.hasGamepadApi;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative px-4 py-3 ${
          isBlocking
            ? 'bg-rose-500/20 border-b border-rose-400/30'
            : 'bg-amber-500/20 border-b border-amber-400/30'
        }`}
        role="alert"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span 
              className={`text-xl ${isBlocking ? 'text-rose-300' : 'text-amber-300'}`}
              aria-hidden="true"
            >
              {isBlocking ? '⚠️' : '💡'}
            </span>
            <div>
              <p className={`text-sm font-medium ${isBlocking ? 'text-rose-200' : 'text-amber-200'}`}>
                {isBlocking
                  ? 'Browser Not Supported'
                  : 'Limited Functionality'}
              </p>
              <ul className="mt-1 text-xs text-white/70">
                {compat.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
              {isBlocking && (
                <p className="mt-1 text-xs text-white/60">
                  Please use Chrome, Edge, or Firefox on desktop for full functionality.
                </p>
              )}
            </div>
          </div>

          {!isBlocking && (
            <button
              onClick={() => setIsDismissed(true)}
              className="rounded-lg px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Dismiss compatibility warning"
            >
              Dismiss
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

UnsupportedBanner.displayName = 'UnsupportedBanner';

/**
 * Hook to get browser compatibility info
 */
export const useBrowserCompatibility = (): BrowserCompatibility => {
  return getBrowserCompatibility();
};

