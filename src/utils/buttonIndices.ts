// Re-export from buttonConstants for backwards compatibility
import { BUTTON } from './buttonConstants';

export { BUTTON as BUTTON_INDICES, AXIS as AXIS_INDICES, BUTTON_LABELS } from './buttonConstants';
export type { ButtonIndex, AxisIndex } from './buttonConstants';

// Alias for trigger indices
export const STANDARD_BUTTONS = {
  ...BUTTON,
  TRIGGER_LEFT: BUTTON.LT,
  TRIGGER_RIGHT: BUTTON.RT,
} as const;
