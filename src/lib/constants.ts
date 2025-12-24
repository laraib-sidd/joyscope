/**
 * Centralized constants and thresholds for the Controller Tester application.
 * Only includes constants that are actually used in the codebase.
 */

// ============================================================================
// Dead Zone & Calibration
// ============================================================================

/** Default dead zone radius (0-1 scale) */
export const DEFAULT_DEAD_ZONE = 0.08;

/** Maximum recommended dead zone */
export const MAX_DEAD_ZONE = 0.5;

/** Minimum dead zone (0 = no dead zone) */
export const MIN_DEAD_ZONE = 0;

// ============================================================================
// Polling
// ============================================================================

/** Interval (ms) between gamepad polls when idle (no controller) */
export const IDLE_POLL_INTERVAL_MS = 1000;

/** Debounce delay for rumble button clicks (ms) */
export const RUMBLE_DEBOUNCE_MS = 200;

// ============================================================================
// Rumble / Haptics
// ============================================================================

/** Default weak motor intensity (0-1) */
export const DEFAULT_WEAK_INTENSITY = 0.5;

/** Default strong motor intensity (0-1) */
export const DEFAULT_STRONG_INTENSITY = 0.5;

/** Default rumble duration in milliseconds */
export const DEFAULT_RUMBLE_DURATION_MS = 200;

/** Quick pulse duration (ms) */
export const QUICK_PULSE_DURATION_MS = 150;

/** Intensity presets for quick pulse buttons */
export const RUMBLE_INTENSITY_PRESETS = {
  low: { weak: 0.2, strong: 0.1 },
  medium: { weak: 0.5, strong: 0.4 },
  high: { weak: 1.0, strong: 0.8 },
} as const;
