/**
 * useGamepads - Hook for polling gamepad state with optimizations
 * Uses requestAnimationFrame with idle detection to reduce CPU usage
 */

import { useEffect, useRef } from 'react';

import { useControllerStore } from '@/state/controllerSlice';
import { usePreferencesStore } from '@/state/preferencesSlice';
import { getVirtualGamepad } from '@/simulators/virtualGamepad';
import { normalizeGamepad } from '@/utils/gamepadMapping';
import {
  isGamepadApiSupported,
  onGamepadConnected,
  onGamepadDisconnected,
  getGamepads,
} from '@/services/gamepadService';
import { IDLE_POLL_INTERVAL_MS } from '@/lib/constants';

export const useGamepads = (): void => {
  const patchControllers = useControllerStore((state) => state.patchControllers);
  const pruneDisconnected = useControllerStore((state) => state.pruneDisconnected);
  const controllers = useControllerStore((state) => state.controllers);
  const simulationMode = usePreferencesStore((state) => state.simulationMode);

  // Refs for RAF management
  const rafIdRef = useRef<number | undefined>(undefined);
  const lastPollTimeRef = useRef<number>(0);
  const hasControllersRef = useRef<boolean>(false);

  // Update ref when controllers change
  useEffect(() => {
    hasControllersRef.current = Object.keys(controllers).length > 0;
  }, [controllers]);

  // Main polling loop with idle optimization
  useEffect(() => {
    let isActive = true;

    const tick = (currentTime: number): void => {
      if (!isActive) return;

      const hasControllers = hasControllersRef.current;
      const timeSinceLastPoll = currentTime - lastPollTimeRef.current;

      // If no controllers and not in simulation mode, poll less frequently
      if (!hasControllers && !simulationMode && timeSinceLastPoll < IDLE_POLL_INTERVAL_MS) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      lastPollTimeRef.current = currentTime;

      if (simulationMode || !isGamepadApiSupported()) {
        const virtualPad = getVirtualGamepad(performance.now());
        patchControllers([virtualPad]);
      } else {
        const pads = getGamepads();
        const normalized = pads.map(normalizeGamepad);

        if (normalized.length > 0) {
          patchControllers(normalized);
        } else {
          pruneDisconnected();
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    // Start the loop
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      isActive = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [patchControllers, pruneDisconnected, simulationMode]);

  // Event listeners for connection/disconnection
  useEffect(() => {
    if (!isGamepadApiSupported() || simulationMode) return;

    const handleConnect = (gamepad: Gamepad): void => {
      const normalized = normalizeGamepad(gamepad);
      patchControllers([normalized]);
    };

    const handleDisconnect = (): void => {
      pruneDisconnected();
    };

    const unsubConnect = onGamepadConnected(handleConnect);
    const unsubDisconnect = onGamepadDisconnected(handleDisconnect);

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, [patchControllers, pruneDisconnected, simulationMode]);
};
