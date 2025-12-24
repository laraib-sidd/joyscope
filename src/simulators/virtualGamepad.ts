import type { NormalizedGamepad } from '@/types/gamepad';

const sine = (time: number, offset: number) => Math.sin((time / 1000 + offset) * 2);

export const getVirtualGamepad = (time: number): NormalizedGamepad => {
  const lx = Number((sine(time, 0) * 0.6).toFixed(3));
  const ly = Number((sine(time, 0.5) * 0.6).toFixed(3));
  const rx = Number((sine(time, 1) * 0.4).toFixed(3));
  const ry = Number((sine(time, 1.5) * 0.4).toFixed(3));

  return {
    id: 'Virtual Xbox Wireless',
    slot: 0,
    mapping: 'standard',
    vendor: 'xbox',
    timestamp: time,
    connected: true,
    buttons: Array.from({ length: 16 }, (_, index) => ({
      index,
      label: ['A', 'B', 'X', 'Y'][index] ?? `Button ${index + 1}`,
      pressed: index === 0 ? Math.random() > 0.8 : false,
      value: index < 4 ? Number((Math.random() * 0.2).toFixed(2)) : 0,
    })),
    axes: [
      { index: 0, label: 'LX', value: lx },
      { index: 1, label: 'LY', value: ly },
      { index: 2, label: 'RX', value: rx },
      { index: 3, label: 'RY', value: ry },
    ],
    haptics: {
      hasRumble: true,
      actuatorType: 'dual-rumble',
    },
  };
};

