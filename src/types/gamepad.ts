export type ButtonReading = {
  index: number;
  label: string;
  pressed: boolean;
  value: number;
};

export type AxisReading = {
  index: number;
  label: string;
  value: number;
};

export type HapticsInfo = {
  hasRumble: boolean;
  actuatorType?: string;
};

export type ControllerVendor = 'xbox' | 'dualshock' | 'switch' | 'generic';

export type NormalizedGamepad = {
  id: string;
  slot: number;
  mapping: string;
  vendor: ControllerVendor;
  timestamp: number;
  connected: boolean;
  buttons: ButtonReading[];
  axes: AxisReading[];
  haptics: HapticsInfo;
};

