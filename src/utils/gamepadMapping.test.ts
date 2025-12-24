import { describe, expect, it } from 'vitest';

import { normalizeGamepad } from './gamepadMapping';

const createGamepad = (id: string): Gamepad =>
  ({
    id,
    index: 0,
    mapping: 'standard',
    connected: true,
    timestamp: 123.456,
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 4 }, () => ({ pressed: false, touched: false, value: 0 })),
    vibrationActuator: {
      type: 'dual-rumble',
      playEffect: () => Promise.resolve('complete'),
      pulse: () => Promise.resolve(),
      reset: () => undefined,
    },
    hapticActuators: [],
    hand: 'right',
    pose: null,
    displayId: 0,
  }) as unknown as Gamepad;

describe('normalizeGamepad', () => {
  it('classifies xbox controllers', () => {
    const normalized = normalizeGamepad(createGamepad('Xbox Wireless Controller'));
    expect(normalized.vendor).toBe('xbox');
    expect(normalized.buttons[0].label).toBe('A');
  });

  it('falls back to generic labels', () => {
    const normalized = normalizeGamepad(createGamepad('Unknown Controller 9000'));
    expect(normalized.vendor).toBe('generic');
    expect(normalized.buttons[0].label).toBe('Button 1');
  });
});

