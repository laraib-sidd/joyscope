/**
 * GamepadService - Centralized abstraction for browser Gamepad API
 * All gamepad-related browser API calls should go through this service
 */

import type { GamepadEffectParameters } from '@/types/gamepadExtended';
import { reportError } from '@/lib/errorReporter';
import {
  QUICK_PULSE_DURATION_MS,
  RUMBLE_INTENSITY_PRESETS,
} from '@/lib/constants';

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Check if the Gamepad API is available
 */
export const isGamepadApiSupported = (): boolean => {
  return typeof window !== 'undefined' && 'getGamepads' in navigator;
};

/**
 * Check if the current context is secure (HTTPS or localhost)
 * Gamepad API requires secure context in some browsers
 */
export const isSecureContext = (): boolean => {
  return typeof window !== 'undefined' && window.isSecureContext;
};

/**
 * Check if haptics/vibration is supported
 */
export const isHapticsSupported = (gamepad: Gamepad): boolean => {
  return Boolean(gamepad.vibrationActuator);
};

/**
 * Get browser compatibility info
 */
export type BrowserCompatibility = {
  isSupported: boolean;
  isSecure: boolean;
  hasGamepadApi: boolean;
  browserName: string;
  hasHapticsSupport: boolean;
  warnings: string[];
};

export const getBrowserCompatibility = (): BrowserCompatibility => {
  const ua = navigator.userAgent.toLowerCase();
  const warnings: string[] = [];
  
  let browserName = 'Unknown';
  let hasHapticsSupport = true;
  
  if (ua.includes('firefox')) {
    browserName = 'Firefox';
    hasHapticsSupport = false;
    warnings.push('Firefox does not support haptic feedback');
  } else if (ua.includes('edg/')) {
    browserName = 'Edge';
  } else if (ua.includes('chrome')) {
    browserName = 'Chrome';
  } else if (ua.includes('safari')) {
    browserName = 'Safari';
    hasHapticsSupport = false;
    warnings.push('Safari has limited Gamepad API support');
  }

  const hasGamepadApi = isGamepadApiSupported();
  const isSecure = isSecureContext();

  if (!hasGamepadApi) {
    warnings.push('Gamepad API is not available in this browser');
  }
  if (!isSecure) {
    warnings.push('Page must be served over HTTPS for full functionality');
  }

  // Check for mobile
  if (/android|iphone|ipad|ipod|mobile/i.test(ua)) {
    warnings.push('Mobile browsers have limited gamepad support');
  }

  return {
    isSupported: hasGamepadApi && isSecure,
    isSecure,
    hasGamepadApi,
    browserName,
    hasHapticsSupport,
    warnings,
  };
};

// ============================================================================
// Gamepad Access
// ============================================================================

/**
 * Get all connected gamepads
 * Returns empty array if API not available
 */
export const getGamepads = (): Gamepad[] => {
  if (!isGamepadApiSupported()) {
    return [];
  }

  try {
    const gamepads = navigator.getGamepads();
    return Array.from(gamepads).filter((pad): pad is Gamepad => pad !== null);
  } catch (error) {
    reportError(error, 'warning', { action: 'getGamepads' });
    return [];
  }
};

/**
 * Get a specific gamepad by index
 */
export const getGamepadByIndex = (index: number): Gamepad | null => {
  if (!isGamepadApiSupported()) {
    return null;
  }

  try {
    const gamepads = navigator.getGamepads();
    return gamepads[index] ?? null;
  } catch (error) {
    reportError(error, 'warning', { action: 'getGamepadByIndex', gamepadIndex: index });
    return null;
  }
};

// ============================================================================
// Event Listeners
// ============================================================================

export type GamepadEventCallback = (gamepad: Gamepad) => void;
export type GamepadDisconnectCallback = (gamepadIndex: number) => void;

/**
 * Subscribe to gamepad connection events
 * Returns cleanup function
 */
export const onGamepadConnected = (callback: GamepadEventCallback): (() => void) => {
  if (!isGamepadApiSupported()) {
    return () => {};
  }

  const handler = (event: GamepadEvent): void => {
    callback(event.gamepad);
  };

  window.addEventListener('gamepadconnected', handler);
  return () => window.removeEventListener('gamepadconnected', handler);
};

/**
 * Subscribe to gamepad disconnection events
 * Returns cleanup function
 */
export const onGamepadDisconnected = (callback: GamepadDisconnectCallback): (() => void) => {
  if (!isGamepadApiSupported()) {
    return () => {};
  }

  const handler = (event: GamepadEvent): void => {
    callback(event.gamepad.index);
  };

  window.addEventListener('gamepaddisconnected', handler);
  return () => window.removeEventListener('gamepaddisconnected', handler);
};

// ============================================================================
// Haptics / Vibration
// ============================================================================

export type RumbleResult = {
  success: boolean;
  error?: string;
};

/**
 * Trigger dual-rumble haptic effect
 */
export const triggerRumble = async (
  gamepadIndex: number,
  params: GamepadEffectParameters
): Promise<RumbleResult> => {
  const gamepad = getGamepadByIndex(gamepadIndex);

  if (!gamepad) {
    return { success: false, error: 'Gamepad not found' };
  }

  if (!gamepad.vibrationActuator) {
    return { success: false, error: 'Haptics not supported on this controller' };
  }

  try {
    await gamepad.vibrationActuator.playEffect('dual-rumble', {
      startDelay: params.startDelay ?? 0,
      duration: params.duration,
      weakMagnitude: params.weakMagnitude ?? 0,
      strongMagnitude: params.strongMagnitude ?? 0,
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Rumble failed';
    reportError(error, 'warning', { action: 'triggerRumble', gamepadIndex });
    return { success: false, error: errorMessage };
  }
};

/**
 * Trigger a quick pulse with preset intensity
 */
export const triggerPulse = async (
  gamepadIndex: number,
  intensity: 'low' | 'medium' | 'high'
): Promise<RumbleResult> => {
  const preset = RUMBLE_INTENSITY_PRESETS[intensity];
  return triggerRumble(gamepadIndex, {
    duration: QUICK_PULSE_DURATION_MS,
    weakMagnitude: preset.weak,
    strongMagnitude: preset.strong,
  });
};

/**
 * Stop all haptic effects on a gamepad
 */
export const stopRumble = async (gamepadIndex: number): Promise<RumbleResult> => {
  const gamepad = getGamepadByIndex(gamepadIndex);

  if (!gamepad?.vibrationActuator) {
    return { success: false, error: 'Gamepad or haptics not available' };
  }

  try {
    await gamepad.vibrationActuator.reset();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Stop rumble failed';
    reportError(error, 'warning', { action: 'stopRumble', gamepadIndex });
    return { success: false, error: errorMessage };
  }
};

// ============================================================================
// Vendor Detection
// ============================================================================

export type ControllerVendor = 'xbox' | 'dualshock' | 'switch' | 'generic';

/**
 * Detect controller vendor from gamepad ID string
 */
export const detectVendor = (gamepadId: string): ControllerVendor => {
  const id = gamepadId.toLowerCase();
  
  if (id.includes('xbox') || id.includes('microsoft') || id.includes('xinput')) {
    return 'xbox';
  }
  if (id.includes('dualshock') || id.includes('playstation') || id.includes('wireless controller') || id.includes('dualsense')) {
    return 'dualshock';
  }
  if (id.includes('nintendo') || id.includes('switch') || id.includes('pro controller')) {
    return 'switch';
  }
  
  return 'generic';
};

