/**
 * Gamepad normalization utilities
 * Transforms raw Gamepad API data into normalized, vendor-agnostic format
 */

import type { ControllerVendor, NormalizedGamepad } from '@/types/gamepad';
import { detectVendor } from '@/services/gamepadService';
import { BUTTON_LABELS, AXIS } from '@/utils/buttonConstants';

// Axis labels (same across all vendors)
const axisLabels: readonly string[] = ['LX', 'LY', 'RX', 'RY'];

/**
 * Get button labels for a specific vendor
 */
const getLabelsForVendor = (vendor: ControllerVendor): Record<number, string> => {
  return BUTTON_LABELS[vendor] ?? BUTTON_LABELS.generic;
};

/**
 * Type for potential vibration actuator
 */
type MaybeActuator = { type?: string } | null | undefined;

/**
 * Normalize a raw Gamepad object into our standardized format
 */
export const normalizeGamepad = (gamepad: Gamepad): NormalizedGamepad => {
  const vendor = detectVendor(gamepad.id);
  const labels = getLabelsForVendor(vendor);
  
  // Access vibration actuator (not in standard types)
  const actuator = (gamepad as Gamepad & { vibrationActuator?: MaybeActuator }).vibrationActuator ?? null;
  const actuatorType = actuator && typeof actuator.type === 'string' ? actuator.type : undefined;
  const hasRumble = Boolean(actuator);

  return {
    id: gamepad.id,
    slot: gamepad.index,
    mapping: gamepad.mapping,
    vendor,
    timestamp: gamepad.timestamp,
    connected: gamepad.connected,
    buttons: gamepad.buttons.map((button, index) => ({
      index,
      label: labels[index] ?? `Button ${index + 1}`,
      pressed: button.pressed,
      value: Number(button.value.toFixed(3)),
    })),
    axes: gamepad.axes.map((value, index) => ({
      index,
      label: axisLabels[index] ?? `Axis ${index + 1}`,
      value: Number(value.toFixed(3)),
    })),
    haptics: {
      hasRumble,
      actuatorType,
    },
  };
};

/**
 * Get the axis value for a specific axis
 */
export const getAxisValue = (gamepad: NormalizedGamepad, axisIndex: number): number => {
  return gamepad.axes[axisIndex]?.value ?? 0;
};

/**
 * Get stick coordinates
 */
export const getStickCoords = (
  gamepad: NormalizedGamepad,
  stick: 'left' | 'right'
): { x: number; y: number } => {
  const xIndex = stick === 'left' ? AXIS.LEFT_X : AXIS.RIGHT_X;
  const yIndex = stick === 'left' ? AXIS.LEFT_Y : AXIS.RIGHT_Y;
  
  return {
    x: getAxisValue(gamepad, xIndex),
    y: getAxisValue(gamepad, yIndex),
  };
};

/**
 * Check if a stick is within the dead zone
 */
export const isInDeadZone = (x: number, y: number, deadZone: number): boolean => {
  const magnitude = Math.sqrt(x * x + y * y);
  return magnitude < deadZone;
};

/**
 * Apply dead zone filtering to stick values
 */
export const applyDeadZone = (
  x: number,
  y: number,
  deadZone: number
): { x: number; y: number; magnitude: number } => {
  const magnitude = Math.sqrt(x * x + y * y);
  
  if (magnitude < deadZone) {
    return { x: 0, y: 0, magnitude: 0 };
  }
  
  // Scale the output so full range is still achievable
  const scaledMagnitude = (magnitude - deadZone) / (1 - deadZone);
  const angle = Math.atan2(y, x);
  
  return {
    x: scaledMagnitude * Math.cos(angle),
    y: scaledMagnitude * Math.sin(angle),
    magnitude: scaledMagnitude,
  };
};
