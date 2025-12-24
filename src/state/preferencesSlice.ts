/**
 * Preferences Slice - User preferences with safe storage and OS sync
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { DEFAULT_DEAD_ZONE, MIN_DEAD_ZONE, MAX_DEAD_ZONE } from '@/lib/constants';
import { safeLocalStorage, reportError } from '@/lib/errorReporter';

type PreferencesStore = {
  simulationMode: boolean;
  reducedMotion: boolean;
  deadZone: number;
  toggleSimulation: () => void;
  toggleReducedMotion: () => void;
  setDeadZone: (value: number) => void;
  syncWithOSPreferences: () => void;
};

/**
 * Check if user prefers reduced motion at OS level
 */
const getOSReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Safe storage wrapper
const safeStorage = {
  getItem: (name: string): string | null => {
    return safeLocalStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    safeLocalStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    safeLocalStorage.removeItem(name);
  },
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      simulationMode: false,
      reducedMotion: getOSReducedMotion(),
      deadZone: DEFAULT_DEAD_ZONE,

      toggleSimulation: () => set((state) => ({ simulationMode: !state.simulationMode })),

      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

      setDeadZone: (value) => {
        const clampedValue = Math.max(MIN_DEAD_ZONE, Math.min(MAX_DEAD_ZONE, value));
        const roundedValue = Number(clampedValue.toFixed(2));
        set({ deadZone: roundedValue });
      },

      syncWithOSPreferences: () => {
        const osReducedMotion = getOSReducedMotion();
        set({ reducedMotion: osReducedMotion });
      },
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => safeStorage),
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as PreferencesStore;
        if (version < 2) {
          if (state.deadZone < MIN_DEAD_ZONE || state.deadZone > MAX_DEAD_ZONE) {
            state.deadZone = DEFAULT_DEAD_ZONE;
          }
        }
        return state;
      },
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            reportError(error, 'warning', { action: 'preferencesRehydrate' });
          }
        };
      },
    }
  )
);

