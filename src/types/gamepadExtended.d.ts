/**
 * Extended type definitions for the Gamepad API
 * These types define vendor-specific haptic features not in standard TypeScript definitions
 */

/**
 * Extended GamepadHapticActuator with playEffect method
 * Standard Gamepad API doesn't include all haptic features
 */
export interface GamepadHapticActuator {
  type: 'vibration' | 'dual-rumble';
  
  /**
   * Play a haptic effect on the gamepad
   * @param type - The type of effect to play
   * @param params - Effect parameters
   * @returns Promise that resolves when effect completes
   */
  playEffect(
    type: 'dual-rumble' | 'trigger-rumble',
    params: GamepadEffectParameters
  ): Promise<GamepadHapticsResult>;
  
  /**
   * Reset all haptic effects
   */
  reset(): Promise<GamepadHapticsResult>;
  
  /**
   * Pulse the actuator (legacy API)
   * @param intensity - Intensity from 0 to 1
   * @param duration - Duration in milliseconds
   */
  pulse?(intensity: number, duration: number): Promise<void>;
}

/**
 * Parameters for gamepad haptic effects
 */
export interface GamepadEffectParameters {
  /** Delay before effect starts (ms) */
  startDelay?: number;
  /** Duration of the effect (ms) */
  duration: number;
  /** Weak motor intensity (0-1), typically high-frequency */
  weakMagnitude?: number;
  /** Strong motor intensity (0-1), typically low-frequency */
  strongMagnitude?: number;
  /** Left trigger motor intensity (Xbox triggers) */
  leftTrigger?: number;
  /** Right trigger motor intensity (Xbox triggers) */
  rightTrigger?: number;
}

/**
 * Result of haptic effect playback
 */
export type GamepadHapticsResult = 'complete' | 'preempted';
