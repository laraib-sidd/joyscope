// Standard Gamepad API button indices
// https://w3c.github.io/gamepad/#remapping

export const BUTTON = {
  // Face buttons
  A: 0,
  B: 1,
  X: 2,
  Y: 3,

  // Bumpers
  LB: 4,
  RB: 5,

  // Triggers (analog)
  LT: 6,
  RT: 7,

  // Center buttons
  BACK: 8,
  START: 9,

  // Stick clicks
  LS: 10,
  RS: 11,

  // D-pad
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,

  // Guide button (may not be available on all controllers)
  GUIDE: 16,
} as const;

export const AXIS = {
  LEFT_X: 0,
  LEFT_Y: 1,
  RIGHT_X: 2,
  RIGHT_Y: 3,
} as const;

// Vendor-specific label overrides
export const BUTTON_LABELS = {
  xbox: {
    [BUTTON.A]: 'A',
    [BUTTON.B]: 'B',
    [BUTTON.X]: 'X',
    [BUTTON.Y]: 'Y',
    [BUTTON.LB]: 'LB',
    [BUTTON.RB]: 'RB',
    [BUTTON.LT]: 'LT',
    [BUTTON.RT]: 'RT',
    [BUTTON.BACK]: 'View',
    [BUTTON.START]: 'Menu',
    [BUTTON.LS]: 'LS',
    [BUTTON.RS]: 'RS',
    [BUTTON.DPAD_UP]: 'D-Up',
    [BUTTON.DPAD_DOWN]: 'D-Down',
    [BUTTON.DPAD_LEFT]: 'D-Left',
    [BUTTON.DPAD_RIGHT]: 'D-Right',
    [BUTTON.GUIDE]: 'Xbox',
  },
  dualshock: {
    [BUTTON.A]: 'Cross',
    [BUTTON.B]: 'Circle',
    [BUTTON.X]: 'Square',
    [BUTTON.Y]: 'Triangle',
    [BUTTON.LB]: 'L1',
    [BUTTON.RB]: 'R1',
    [BUTTON.LT]: 'L2',
    [BUTTON.RT]: 'R2',
    [BUTTON.BACK]: 'Share',
    [BUTTON.START]: 'Options',
    [BUTTON.LS]: 'L3',
    [BUTTON.RS]: 'R3',
    [BUTTON.DPAD_UP]: 'D-Up',
    [BUTTON.DPAD_DOWN]: 'D-Down',
    [BUTTON.DPAD_LEFT]: 'D-Left',
    [BUTTON.DPAD_RIGHT]: 'D-Right',
    [BUTTON.GUIDE]: 'PS',
  },
  switch: {
    [BUTTON.A]: 'B',
    [BUTTON.B]: 'A',
    [BUTTON.X]: 'Y',
    [BUTTON.Y]: 'X',
    [BUTTON.LB]: 'L',
    [BUTTON.RB]: 'R',
    [BUTTON.LT]: 'ZL',
    [BUTTON.RT]: 'ZR',
    [BUTTON.BACK]: 'Minus',
    [BUTTON.START]: 'Plus',
    [BUTTON.LS]: 'LStick',
    [BUTTON.RS]: 'RStick',
    [BUTTON.DPAD_UP]: 'D-Up',
    [BUTTON.DPAD_DOWN]: 'D-Down',
    [BUTTON.DPAD_LEFT]: 'D-Left',
    [BUTTON.DPAD_RIGHT]: 'D-Right',
    [BUTTON.GUIDE]: 'Home',
  },
  generic: {
    [BUTTON.A]: 'Button 1',
    [BUTTON.B]: 'Button 2',
    [BUTTON.X]: 'Button 3',
    [BUTTON.Y]: 'Button 4',
    [BUTTON.LB]: 'Button 5',
    [BUTTON.RB]: 'Button 6',
    [BUTTON.LT]: 'Button 7',
    [BUTTON.RT]: 'Button 8',
    [BUTTON.BACK]: 'Button 9',
    [BUTTON.START]: 'Button 10',
    [BUTTON.LS]: 'Button 11',
    [BUTTON.RS]: 'Button 12',
    [BUTTON.DPAD_UP]: 'Button 13',
    [BUTTON.DPAD_DOWN]: 'Button 14',
    [BUTTON.DPAD_LEFT]: 'Button 15',
    [BUTTON.DPAD_RIGHT]: 'Button 16',
    [BUTTON.GUIDE]: 'Button 17',
  },
} as const;

export type ButtonIndex = (typeof BUTTON)[keyof typeof BUTTON];
export type AxisIndex = (typeof AXIS)[keyof typeof AXIS];



