import { create } from 'zustand';

import type { NormalizedGamepad } from '@/types/gamepad';

type ControllerStore = {
  controllers: Record<number, NormalizedGamepad>;
  activeSlot?: number;
  lastUpdate?: number;
  setActiveSlot: (slot: number) => void;
  patchControllers: (controllers: NormalizedGamepad[]) => void;
  pruneDisconnected: () => void;
};

export const useControllerStore = create<ControllerStore>((set) => ({
  controllers: {},
  activeSlot: undefined,
  lastUpdate: undefined,
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  patchControllers: (controllers) =>
    set((state) => {
      const next = { ...state.controllers };
      controllers.forEach((controller) => {
        next[controller.slot] = controller;
      });
      const activeSlot = state.activeSlot ?? controllers[0]?.slot;
      return {
        controllers: next,
        activeSlot,
        lastUpdate: performance.now(),
      };
    }),
  pruneDisconnected: () =>
    set((state) => {
      const next: Record<number, NormalizedGamepad> = {};
      Object.values(state.controllers).forEach((controller) => {
        if (controller.connected) {
          next[controller.slot] = controller;
        }
      });
      const slots = Object.keys(next).map(Number);
      return {
        controllers: next,
        activeSlot: slots.includes(state.activeSlot ?? -1) ? state.activeSlot : slots[0],
      };
    }),
}));

